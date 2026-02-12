import { useState, useEffect } from "react";
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleHeader from "@/components/modules/admin/roles/RoleHeader";
import RoleList from "@/components/modules/admin/roles/RoleList";
import RoleForm from "@/components/modules/admin/roles/RoleForm";
import { Role, getRoles, createRole, updateRole, deleteRole, assignPermissionsToGroup } from "@/utils/api/admin/roles";
import { toast } from "react-toastify";

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const data = await getRoles();
            setRoles(data);
        } catch (error) {
            console.error("Error loading roles:", error);
            toast.error("Error al cargar los roles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (name: string, permissionData: any) => {
        try {
            let roleId = editingRole?.id;
            if (editingRole) {
                await updateRole(editingRole.id, name);
                toast.success("Rol actualizado con éxito");
            } else {
                const newRole = await createRole(name);
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
                        onSave={handleSave}
                        onClose={() => setIsFormOpen(false)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
