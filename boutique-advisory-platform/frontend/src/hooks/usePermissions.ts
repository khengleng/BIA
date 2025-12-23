'use client';

/**
 * usePermissions Hook
 * 
 * Provides centralized permission checks for React components.
 * Eliminates scattered role checks across the codebase.
 * 
 * Usage:
 * const { canCreateSME, canEditDeal, isAdmin } = usePermissions();
 * 
 * {canCreateSME && <button>Add SME</button>}
 */

import { useState, useEffect, useMemo, ReactNode } from 'react';
import {
    createPermissionHelpers,
    PermissionHelpers,
    User,
    UserRole,
    Resource,
    PermissionAction,
    hasPermission as checkPermission,
    canPerformAction
} from '../lib/permissions';

/**
 * Get current user from localStorage
 */
function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    try {
        const userData = localStorage.getItem('user');
        if (!userData) return null;
        return JSON.parse(userData) as User;
    } catch {
        return null;
    }
}

/**
 * Main permissions hook
 */
export function usePermissions(): PermissionHelpers & {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
} {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
            setIsLoading(false);
        };

        loadUser();

        // Listen for storage changes (e.g., login/logout in another tab)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user') {
                loadUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const helpers = useMemo(() => createPermissionHelpers(user), [user]);

    return {
        ...helpers,
        user,
        isLoading,
        isAuthenticated: !!user,
    };
}

/**
 * Hook to check a specific permission
 */
export function useHasPermission(
    permission: string,
    isOwner: boolean = false
): boolean {
    const { user } = usePermissions();
    return checkPermission(user?.role, permission, isOwner);
}

/**
 * Hook to check if user can perform an action on a resource
 */
export function useCanPerform(
    resource: Resource,
    action: PermissionAction,
    isOwner: boolean = false
): boolean {
    const { user } = usePermissions();
    return canPerformAction(user?.role, resource, action, isOwner);
}

/**
 * Hook for resource-specific ownership checks
 */
export function useResourcePermissions(resourceOwnerId?: string) {
    const { user, ...permissions } = usePermissions();

    const isOwner = !!(user && resourceOwnerId && user.id === resourceOwnerId);

    return {
        ...permissions,
        user,
        isOwner,
        // Override methods with owner context
        canEditSME: permissions.canEditSME(isOwner),
        canEditInvestor: permissions.canEditInvestor(isOwner),
        canEditDeal: permissions.canEditDeal(isOwner),
        canUploadDocument: permissions.canUploadDocument(isOwner),
        canDownloadDocument: permissions.canDownloadDocument(isOwner),
        canDeleteDocument: permissions.canDeleteDocument(isOwner),
    };
}

/**
 * Props for conditional rendering components
 */
interface ConditionalRenderProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface PermissionProps extends ConditionalRenderProps {
    permission: string;
    isOwner?: boolean;
}

interface RoleProps extends ConditionalRenderProps {
    roles: UserRole[];
}

interface OwnerProps extends ConditionalRenderProps {
    ownerId?: string;
}

/**
 * Component for conditional rendering based on permission
 */
export function IfPermission({
    permission,
    isOwner = false,
    children,
    fallback = null
}: PermissionProps): ReactNode {
    const hasAccess = useHasPermission(permission, isOwner);
    if (hasAccess) {
        return children;
    }
    return fallback;
}

/**
 * Component for role-based rendering
 */
export function IfRole({
    roles,
    children,
    fallback = null
}: RoleProps): ReactNode {
    const { user } = usePermissions();
    const hasRole = user && roles.includes(user.role as UserRole);
    if (hasRole) {
        return children;
    }
    return fallback;
}

/**
 * Component for admin-only content
 */
export function AdminOnly({
    children,
    fallback = null
}: ConditionalRenderProps): ReactNode {
    const { isAdmin } = usePermissions();
    if (isAdmin) {
        return children;
    }
    return fallback;
}

/**
 * Component for owner-based content
 */
export function OwnerOnly({
    ownerId,
    children,
    fallback = null
}: OwnerProps): ReactNode {
    const { user, isAdmin } = usePermissions();
    const isOwner = user && ownerId && user.id === ownerId;

    // Admins can also see owner content
    if (isOwner || isAdmin) {
        return children;
    }
    return fallback;
}

export default usePermissions;
