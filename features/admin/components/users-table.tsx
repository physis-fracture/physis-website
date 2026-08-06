'use client';

import { useState } from 'react';
import { UserProfile } from '../api/get-users';
import { createUser, toggleUserActive, updateUserRole } from '../actions/manage-user';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export function UsersTable({ users }: { users: UserProfile[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'radiologist' | 'admin'>('radiologist');

  async function handleCreateUser(formData: FormData) {
    setIsLoading(true);
    const result = await createUser(formData);
    setIsLoading(false);

    if (result.success) {
      toast.success('User created successfully');
      setIsDialogOpen(false);
    } else {
      toast.error(result.error || 'Failed to create user');
    }
  }

  async function handleToggleActive(userId: string, currentStatus: boolean) {
    const result = await toggleUserActive(userId, !currentStatus);
    if (result.success) {
      toast.success(`User ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
    } else {
      toast.error(result.error || 'Failed to update user status');
    }
  }

  async function handleRoleChange(userId: string, role: 'radiologist' | 'admin') {
    const result = await updateUserRole(userId, role);
    if (result.success) {
      toast.success('User role updated successfully');
    } else {
      toast.error(result.error || 'Failed to update user role');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">System Users</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system. They will receive an email to set up their account.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateUser}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" name="password" type="password" required minLength={6} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="displayName">Display Name</FieldLabel>
                  <Input id="displayName" name="displayName" required />
                </Field>
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as 'radiologist' | 'admin')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="radiologist">Radiologist</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="role" value={role} />
                </Field>
                <DialogFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Spinner data-icon="inline-start" />}
                    {isLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Display Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.display_name}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_active ? 'outline' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Disabled'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => handleToggleActive(user.id, user.is_active || false)}>
                          {user.is_active ? 'Disable User' : 'Enable User'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'radiologist' : 'admin')}>
                          Change to {user.role === 'admin' ? 'Radiologist' : 'Admin'}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
