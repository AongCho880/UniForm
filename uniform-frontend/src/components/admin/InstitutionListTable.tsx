// uniform-frontend/src/components/admin/InstitutionListTable.tsx
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Building2, Trash2, ArrowUpDown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';

// Extended type to include InstitutionCategory
export interface InstitutionWithCategory {
  institutionId: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  establishedYear?: number | null;
  logoUrl?: string | null;
  ownership?: 'PUBLIC' | 'PRIVATE' | null;
  type?: 'GENERAL' | 'ENGINEERING' | null;
  createdAt: string;
  updatedAt: string;
  InstitutionCategory?: {
    institutionCategoryId: string;
    name: string;
    description?: string | null;
  } | null;
}

interface InstitutionListTableProps {
  institutions: InstitutionWithCategory[];
  loading: boolean;
  sortField: 'name' | 'createdAt';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'name' | 'createdAt') => void;
  onDelete: (institution: InstitutionWithCategory) => void;
  onEdit: (institution: InstitutionWithCategory) => void;
  query?: string;
  onRowClick?: (institutionId: string) => void;
}

export function InstitutionListTable({
  institutions,
  loading,
  onSort,
  onDelete,
  query = '',
  onRowClick,
}: InstitutionListTableProps) {
  // Function to get category badge color based on category name
  const getCategoryBadgeColor = (categoryName: string) => {
    void categoryName; // referenced to satisfy no-unused-vars while keeping signature
    return 'bg-gray-100 text-gray-800';
  };

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text: string | undefined | null, q: string) => {
    const t = text ?? '';
    if (!q.trim()) return t;
    try {
      const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
      const parts = t.split(re);
      return (
        <>
          {parts.map((part, idx) =>
            re.test(part) ? (
              <mark key={idx} className="bg-gray-200 px-0.5 rounded">
                {part}
              </mark>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </>
      );
    } catch {
      return t;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        Loading institutions...
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer flex items-center"
              onClick={() => onSort('name')}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead>Classification</TableHead>
            <TableHead
              className="cursor-pointer flex items-center"
              onClick={() => onSort('createdAt')}
            >
              Created Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No institutions found
              </TableCell>
            </TableRow>
          ) : (
            institutions.map((institution) => (
              <TableRow
                key={institution.institutionId}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(institution.institutionId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick?.(institution.institutionId)
                  }
                }}
              >
                <TableCell>
                  <Link
                    to={'/admin/institutions/$institutionId'}
                    params={{ institutionId: institution.institutionId }}
                    className="flex items-center text-inherit hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {institution.logoUrl ? (
                      <img
                        src={institution.logoUrl}
                        alt={`${institution.name} logo`}
                        className="mr-2 h-6 w-6 rounded object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Building2 className="mr-2 h-4 w-4 text-gray-500" />
                    )}
                    <span>{highlight(institution.name, query)}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {institution.InstitutionCategory?.name ? (
                      <Badge className={getCategoryBadgeColor(institution.InstitutionCategory.name)}>
                        {highlight(institution.InstitutionCategory.name, query)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Uncategorized</Badge>
                    )}
                    {institution.type && (
                      <Badge className={
                        institution.type === 'ENGINEERING'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-gray-100 text-gray-700'
                      }>
                        {institution.type.charAt(0) + institution.type.slice(1).toLowerCase()}
                      </Badge>
                    )}
                    {institution.ownership && (
                      <Badge className={
                        institution.ownership === 'PUBLIC'
                          ? 'bg-gray-300 text-gray-900'
                          : 'bg-gray-200 text-gray-800'
                      }>
                        {institution.ownership.charAt(0) + institution.ownership.slice(1).toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {format(new Date(institution.createdAt), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(institution)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
