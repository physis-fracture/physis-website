'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
  role: z.enum(['radiologist', 'admin']),
});

export async function createUser(formData: FormData) {
  const supabaseAdmin = await createAdminClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;
  const role = formData.get('role') as 'radiologist' | 'admin';

  const parseResult = createUserSchema.safeParse({ email, password, displayName, role });
  if (!parseResult.success) {
    return { success: false, error: 'Invalid form data' };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
    app_metadata: { role },
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Failed to create auth user' };
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: userId,
        display_name: displayName,
        role,
        is_active: true,
      },
      { onConflict: 'id' },
    );

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  await supabaseAdmin.from('audit_events').insert({
    actor_id: userId,
    event_type: 'user_created',
    metadata: { email, role },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabaseAdmin = await createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);
    
  if (error) {
    return { success: false, error: error.message };
  }

  await supabaseAdmin.from('audit_events').insert({
    actor_id: userId,
    event_type: isActive ? 'user_enabled' : 'user_disabled',
    metadata: {},
  });

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserRole(userId: string, role: 'radiologist' | 'admin') {
  const supabaseAdmin = await createAdminClient();
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', userId);
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/users');
  return { success: true };
}
