import { ChevronRight, ChevronDown, Shield, User, Settings } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type {  RoleNodeHeaderProps } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';



export const RoleNodeHeader = ({
    node,
    isOpen,
    hasChildren,
    onToggle,
    onEdit,
    onDelete,
    onAssignProfile,
    profiles
}: RoleNodeHeaderProps) => {
    const isRoot = node.depth === 0;
    const currentProfile = node.profile_id?.toString() ?? '';
    return (
        <div
            className={cn(
                "flex items-center gap-3 p-3 select-none",
                isRoot ? "bg-slate-900 text-white" : "hover:bg-accent/50"
            )}
            onClick={() => hasChildren && onToggle()}
        >
            <div className="w-5 flex justify-center">
                {hasChildren ? (
                    isOpen ? (
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    ) : (
                        <ChevronRight className="h-4 w-4 opacity-50" />
                    )
                ) : (
                    <div className="w-4" />
                )}
            </div>

            {isRoot ? (
                <Shield className="h-5 w-5 text-primary" />
            ) : (
                <User className="h-4 w-4 text-muted-foreground" />
            )}

            
            {/* Role name */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{node.rolename}</span>
                    {isRoot && <Badge variant="secondary" className="text-xs">Root</Badge>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>ID: {node.roleid}</span>
                    <span>Sharing: {node.sharing_rule}</span>
                </div>
            </div>
            
            {/* Profile selector */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Select
                    value={currentProfile}
                    onValueChange={(val) => onAssignProfile?.(node.roleid, val)}
                    disabled={!profiles || profiles.length === 0}
                >
                    <SelectTrigger className="w-40 h-7 text-xs">
                        <SelectValue placeholder="Sin perfil" />
                    </SelectTrigger>
                    <SelectContent>
                        {profiles?.map(p => (
                            <SelectItem key={p.profileid} value={p.profileid.toString()}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity group-hover:opacity-100">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(node);
                    }}
                >
                    <Settings className="h-4 w-4" />
                </Button>
                {!isRoot && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(node.roleid);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </Button>
                )}
            </div>
        </div>
    );
};