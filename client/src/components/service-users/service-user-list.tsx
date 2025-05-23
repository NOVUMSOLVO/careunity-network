/**
 * Service User List component
 */

import React, { useState } from 'react';
import { useServiceUsers } from '@/hooks/use-service-users';
import { ServiceUser } from '@shared/types/service-user';
import { RouterLink } from '@/components/router/router-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar 
} from 'lucide-react';

interface ServiceUserListProps {
  onEdit?: (serviceUser: ServiceUser) => void;
  onDelete?: (serviceUser: ServiceUser) => void;
  onView?: (serviceUser: ServiceUser) => void;
}

export function ServiceUserList({ onEdit, onDelete, onView }: ServiceUserListProps) {
  const { data: serviceUsers, isLoading, error } = useServiceUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter service users based on search query
  const filteredServiceUsers = serviceUsers?.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Paginate service users
  const totalPages = Math.ceil((filteredServiceUsers?.length || 0) / itemsPerPage);
  const paginatedServiceUsers = filteredServiceUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading service users...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        Error loading service users: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Users</CardTitle>
            <CardDescription>
              Manage your service users and their care plans
            </CardDescription>
          </div>
          <Button asChild>
            <RouterLink to="/service-users/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Service User
            </RouterLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search service users..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServiceUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No service users found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedServiceUsers.map((serviceUser) => (
                  <TableRow key={serviceUser.id}>
                    <TableCell className="font-medium">{serviceUser.uniqueId}</TableCell>
                    <TableCell>
                      <RouterLink 
                        to={`/service-users/${serviceUser.id}`}
                        className="hover:underline"
                      >
                        {serviceUser.fullName}
                      </RouterLink>
                    </TableCell>
                    <TableCell>{serviceUser.dateOfBirth}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(serviceUser.status) as any}>
                        {serviceUser.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onView?.(serviceUser)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/service-users/${serviceUser.id}/care-plans`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Care Plans
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/service-users/${serviceUser.id}/appointments`}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Appointments
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit?.(serviceUser)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(serviceUser)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}
