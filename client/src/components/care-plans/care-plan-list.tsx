/**
 * Care Plan List component
 */

import React, { useState } from 'react';
import { useCarePlans } from '@/hooks/use-care-plans';
import { CarePlan } from '@shared/types/care-plan';
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
  Target 
} from 'lucide-react';

interface CarePlanListProps {
  serviceUserId?: number;
  onEdit?: (carePlan: CarePlan) => void;
  onDelete?: (carePlan: CarePlan) => void;
  onView?: (carePlan: CarePlan) => void;
}

export function CarePlanList({ 
  serviceUserId, 
  onEdit, 
  onDelete, 
  onView 
}: CarePlanListProps) {
  const { data: carePlans, isLoading, error } = useCarePlans(serviceUserId);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter care plans based on search query
  const filteredCarePlans = carePlans?.filter(plan => 
    plan.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Paginate care plans
  const totalPages = Math.ceil((filteredCarePlans?.length || 0) / itemsPerPage);
  const paginatedCarePlans = filteredCarePlans.slice(
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
      case 'completed':
        return 'secondary';
      case 'pending':
        return 'warning';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading care plans...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        Error loading care plans: {error.message}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Care Plans</CardTitle>
            <CardDescription>
              {serviceUserId 
                ? 'Manage care plans for this service user' 
                : 'Manage all care plans'}
            </CardDescription>
          </div>
          <Button asChild>
            <RouterLink to={serviceUserId 
              ? `/service-users/${serviceUserId}/care-plans/new` 
              : '/care-plans/new'
            }>
              <Plus className="mr-2 h-4 w-4" />
              Add Care Plan
            </RouterLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search care plans..."
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
                <TableHead>Title</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCarePlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No care plans found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCarePlans.map((carePlan) => (
                  <TableRow key={carePlan.id}>
                    <TableCell className="font-medium">
                      <RouterLink 
                        to={`/care-plans/${carePlan.id}`}
                        className="hover:underline"
                      >
                        {carePlan.title}
                      </RouterLink>
                    </TableCell>
                    <TableCell>{carePlan.startDate}</TableCell>
                    <TableCell>{carePlan.reviewDate || 'Not set'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(carePlan.status) as any}>
                        {carePlan.status}
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
                          <DropdownMenuItem onClick={() => onView?.(carePlan)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <RouterLink to={`/care-plans/${carePlan.id}/goals`}>
                              <Target className="mr-2 h-4 w-4" />
                              Goals & Tasks
                            </RouterLink>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onEdit?.(carePlan)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete?.(carePlan)}
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
