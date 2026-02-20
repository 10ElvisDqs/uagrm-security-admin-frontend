import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleHeader from "@/components/modules/admin/roles/RoleHeader";
import RoleList from "@/components/modules/admin/roles/RoleList";
import RoleForm from "@/components/modules/admin/roles/RoleForm";
import { Role, RolePayload, getRoles, createRole, updateRole, deleteRole, assignPermissionsToGroup } from "@/utils/api/admin/roles";
import { toast } from "react-toastify";
import getCurrentAccessRoleName from "@/utils/api/auth/getCurrentAccessRole";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [currentAccessRoleName, setCurrentAccessRoleName] = useState<string | null>(null);
    const [currentAccessLevel, setCurrentAccessLevel] = useState<number | null>(null);
    const [currentAccessRoleId, setCurrentAccessRoleId] = useState<string | null>(null);

    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        loadRoles();
        loadCurrentAccessRole();
    }, []);

    const loadRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
            if (currentAccessRoleName) {
                const roleMatch = data.find(r => r.name === currentAccessRoleName);
                if (roleMatch?.nivel !== undefined && roleMatch?.nivel !== null) {
                    setCurrentAccessLevel(Number(roleMatch.nivel));
                }
                if (roleMatch?.id !== undefined && roleMatch?.id !== null) {
                    setCurrentAccessRoleId(String(roleMatch.id));
                }
            }
        } catch (error) {
            console.error("Error loading roles:", error);
            toast.error("Error al cargar los roles");
        } finally {
            setIsLoading(false);
        }
    };

    const loadCurrentAccessRole = async () => {
        try {
            const roleName = await getCurrentAccessRoleName();
            const fallback = user?.role && typeof user.role === 'string' ? user.role : null;
            const finalName = roleName || fallback;
            setCurrentAccessRoleName(finalName);
            if (finalName && roles.length > 0) {
                const roleMatch = roles.find(r => r.name === finalName);
                if (roleMatch?.nivel !== undefined && roleMatch?.nivel !== null) {
                    setCurrentAccessLevel(Number(roleMatch.nivel));
                }
                if (roleMatch?.id !== undefined && roleMatch?.id !== null) {
                    setCurrentAccessRoleId(String(roleMatch.id));
                }
            }
        } catch (error) {
            console.error("Error loading current access role:", error);
        }
    };

    useEffect(() => {
        if (currentAccessRoleName && roles.length > 0) {
            const roleMatch = roles.find(r => r.name === currentAccessRoleName);
            if (roleMatch?.nivel !== undefined && roleMatch?.nivel !== null) {
                setCurrentAccessLevel(Number(roleMatch.nivel));
            }
            if (roleMatch?.id !== undefined && roleMatch?.id !== null) {
                setCurrentAccessRoleId(String(roleMatch.id));
            }
        }
    }, [currentAccessRoleName, roles]);

    const handleSave = async (payload: RolePayload, permissionData: any) => {
        try {
            if (currentAccessLevel !== null && payload.nivel !== undefined && payload.nivel <= currentAccessLevel) {
                toast.error(`No podés crear/editar un rol con nivel <= ${currentAccessLevel}.`);
                return;
            }
            let roleId = editingRole?.id;
            if (editingRole) {
                await updateRole(editingRole.id, payload);
                toast.success("Rol actualizado con éxito");
            } else {
                const newRole = await createRole(payload);
                roleId = newRole.id;
                toast.success("Rol creado con éxito");
            }

            if (roleId && permissionData.assignments) {
                const assignments = permissionData.assignments;
                const systemIds = Object.keys(assignments);

                for (const sysId of systemIds) {
                    await assignPermissionsToGroup({
                        group: roleId,
                        aplicacion: sysId,
                        permissions: assignments[sysId]
                    });
                }
                toast.success("Permisos asignados correctamente");
            }

            setIsFormOpen(false);
            loadRoles();
        } catch (error) {
            console.error("Error saving role:", error);
            toast.error("Error al guardar el rol y sus permisos");
        }
    };

    const handleDelete = async (role: Role) => {
        if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) return;
        try {
            await deleteRole(role.id);
            toast.success("Rol eliminado");
            loadRoles();
        } catch (error) {
            toast.error("Error al eliminar el rol");
        }
    };

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <RoleHeader onAdd={() => {
                    setEditingRole(null);
                    setIsFormOpen(true);
                }} />

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                    </div>
                ) : (
                    <RoleList
                        roles={roles}
                        onEdit={(role) => {
                            setEditingRole(role);
                            setIsFormOpen(true);
                        }}
                        onDelete={handleDelete}
                    />
                )}

                {isFormOpen && (
                    <RoleForm
                        role={editingRole}
                        roles={roles}
                        currentAccessLevel={currentAccessLevel}
                        currentAccessRoleId={currentAccessRoleId}
                        onSave={handleSave}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
