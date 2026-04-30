import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, Phone, Building2, Shield, Calendar, 
  User, Hash, Loader2, Copy, Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUserDetail } from "../hooks/use-user-detail";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getStatusColor } from "../components/GetStatusColor";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getHierarchicalRoleColor } from "../components/getHierarchicalRoleColor";

/**
 * UserDetailPage - Enhanced user profile view with clean design
 * 
 * Features:
 * - Clean, card-based layout with visual hierarchy
 * - Copy-to-clipboard for email/username
 * - Badges for admin flag + hierarchical role + status
 * - Responsive grid layout
 * - Action buttons (Edit, Change Password, Back)
 */
export const UserDetailPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const numericUserId = useMemo(() => {
    if (!userId) return null;
    const parsed = parseInt(userId,10);
    return isNaN(parsed) ? null : parsed;
  },[userId]);
  const { data: user, isLoading } = useUserDetail(numericUserId);

  
  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(`Failed to copy ${field}`);
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">User not found</h3>
        <p className="text-muted-foreground mb-4">The requested user does not exist or has been deleted.</p>
        <Button onClick={() => navigate("/dashboard/settings/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        
        {/* 🔝 Header con acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
                {user.is_admin && (
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">Admin</Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user.user_name}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`/dashboard/settings/users/${userId}/edit`)}>
              ✏️ Edit
            </Button>
            <Button variant="outline" onClick={() => navigate(`/dashboard/settings/users/${userId}/password`)}>
              🔑 Change Password
            </Button>
          </div>
        </div>

        {/* 📋 Grid de tarjetas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* 👤 Perfil Principal (2 columnas en desktop) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Nombre y Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</label>
                  <p className="mt-1 text-lg font-medium">{user.first_name} {user.last_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                    <span>Username</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={() => copyToClipboard(user.user_name, 'Username')}
                    >
                      {copiedField === 'Username' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </label>
                  <p className="mt-1 font-mono text-sm bg-muted/50 px-2 py-1 rounded">@{user.user_name}</p>
                </div>
              </div>

              <Separator />

              {/* Contacto */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</label>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{user.email || "—"}</span>
                  {user.email && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2"
                      onClick={() => copyToClipboard(user.email, 'Email')}
                    >
                      {copiedField === 'Email' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  )}
                </div>
                
                {user.phone_crm && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.phone_crm}</span>
                  </div>
                )}
                
                {user.department && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{user.department}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 🔐 Account & Roles (1 columna en desktop) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account
              </CardTitle>
              <CardDescription>Permissions and hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Badges de permisos */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Access Level</label>
                <div className="flex flex-wrap gap-2">
                  {user.is_admin && (
                    <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                      <Shield className="h-3 w-3 mr-1" />
                      System Admin
                    </Badge>
                  )}
                  
                  {user.rolename ? (
                    <Badge variant="outline" className={getHierarchicalRoleColor(user.rolename)}>
                      {user.rolename}
                    </Badge>
                  ) : user.role_id ? (
                    <Badge variant="secondary" className="text-xs">{user.role_id}</Badge>
                  ) : (
                    <Badge variant="outline">Usuario</Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                <div className="mt-2">
                  <Badge variant="outline" className={getStatusColor(user.status)}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {user.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Reports To */}
              {user.reports_to_id && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reports To</label>
                  <p className="mt-2 flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">ID #{user.reports_to_id}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 🔧 System Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>Technical identifiers and metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">User ID</span>
                <p className="font-mono bg-muted/50 px-2 py-1 rounded">{user.id}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Role ID</span>
                <p className="font-mono bg-muted/50 px-2 py-1 rounded">{user.role_id || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Active</span>
                <p className="font-medium">{user.is_active ? "Yes" : "No"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Last Modified</span>
                <p className="font-medium">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </ErrorBoundary>
  );
};

export default UserDetailPage;