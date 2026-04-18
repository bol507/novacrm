import { useState, useEffect } from "react";
import { AlertCircleIcon, Check, ChevronsUpDown, Folder, Loader2, SearchIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSearchProjects } from "../hooks/use-search-projects";

export interface ProjectSearchResult {
    id: number;
    projectname: string;
    project_no?: string;
    projectstatus?: string;
    account_name?: string;
}

export interface ProjectSearchProps {
    value?: number | null;
    onChange: (projectId: number | null, projectName?: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    initialProjectName?: string;
}

/**
 * ProjectSearch Component
 *
 * An autocomplete search component for selecting projects.
 * Features include debounced search, loading states, error handling,
 * and visual feedback for selected items.
 *
 * @component
 * @param props - Component props
 * @param props.value - Currently selected project ID
 * @param props.onChange - Callback when project selection changes
 * @param props.placeholder - Input placeholder text
 * @param props.disabled - Whether the component is disabled
 * @param props.className - Additional CSS classes
 * @returns The rendered project search component
 */
export const ProjectSearch = ({
    value,
    onChange,
    placeholder = "Search project...",
    disabled = false,
    className,
    initialProjectName,
}: ProjectSearchProps) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProject, setSelectedProject] = useState<ProjectSearchResult | null>(null);

    const {
        data: projects,
        isFetching,
        isError
    } = useSearchProjects(searchTerm);

    useEffect(() => {
        if (value && projects.length > 0) {
            const found = projects.find((p) => p.id === value);
            if (found) setSelectedProject(found);
        } else if (!value) {
            setSelectedProject(null);
        }
        
        else if (value && initialProjectName && !selectedProject) {
            setSelectedProject({
                id: value,
                projectname: initialProjectName,
                project_no: undefined,
                projectstatus: undefined,
                account_name: undefined,
            });
        }
    }, [value, projects, initialProjectName]);

    const handleSelect = (project: ProjectSearchResult) => {
        setSelectedProject(project);
        onChange(project.id, project.projectname);
        setOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProject(null);
        onChange(null);
        setSearchTerm("");
    };

    const hasSearched = searchTerm.trim().length >= 2;
    const isSearching = isFetching && hasSearched;
    const hasNoResults = !isSearching && hasSearched && projects.length === 0;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between font-normal transition-colors",
                        !selectedProject && "text-muted-foreground",
                        disabled && "opacity-50 cursor-not-allowed",
                        className
                    )}
                    disabled={disabled}
                >
                    <span className="truncate">
                        {selectedProject
                            ? `${selectedProject.projectname} ${selectedProject.project_no ? `(${selectedProject.project_no})` : ''}`
                            : value && initialProjectName
                                ? initialProjectName
                                : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="h-9"
                    />
                    <CommandList>
                        {isSearching && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    Searching projects...
                                </p>
                                <p className="text-xs text-muted-foreground/70 mt-1">
                                    "{searchTerm}"
                                </p>
                            </div>
                        )}

                        {isError && hasSearched && (
                            <div className="flex flex-col items-center justify-center py-8 text-destructive">
                                <AlertCircleIcon className="h-6 w-6 mb-3" />
                                <p className="text-sm font-medium">Search error</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Please try again
                                </p>
                            </div>
                        )}

                        {hasNoResults && !isError && (
                            <CommandEmpty>
                                <div className="flex flex-col items-center py-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                        <SearchIcon className="h-6 w-6 text-muted-foreground/70" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        No projects found
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">
                                        Try a different search term
                                    </p>
                                </div>
                            </CommandEmpty>
                        )}

                        {!hasSearched && searchTerm.length > 0 && (
                            <CommandEmpty>
                                <div className="flex items-center justify-center py-6 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Type at least <span className="font-semibold">2 characters</span> to search
                                    </p>
                                </div>
                            </CommandEmpty>
                        )}

                        {!isSearching && !isError && projects.length > 0 && (
                            <CommandGroup>
                                {projects.map((project) => (
                                    <CommandItem
                                        key={project.id}
                                        value={project.projectname}
                                        onSelect={() => handleSelect(project)}
                                        className="flex flex-col items-start gap-1 py-3 px-4 cursor-pointer aria-selected:bg-accent transition-colors"
                                    >
                                        <div className="flex items-center justify-between w-full">
                                            <span className="font-medium text-sm">
                                                {project.projectname}
                                            </span>
                                            <Check
                                                className={cn(
                                                    "h-4 w-4 shrink-0 transition-opacity",
                                                    value === project.id
                                                        ? "opacity-100 text-primary"
                                                        : "opacity-0"
                                                )}
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {project.project_no && (
                                                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded border">
                                                    {project.project_no}
                                                </span>
                                            )}
                                            {project.account_name && (
                                                <span className="truncate max-w-[150px]" title={project.account_name}>
                                                    {project.account_name}
                                                </span>
                                            )}
                                            {project.projectstatus && (
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-medium border",
                                                    project.projectstatus === 'Active' || project.projectstatus === 'In Progress'
                                                        ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                                                        : project.projectstatus === 'On Hold'
                                                            ? 'bg-warning/10 text-warning border-warning/20'
                                                            : 'bg-muted text-muted-foreground border-border'
                                                )}>
                                                    {project.projectstatus}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}

                                <div className="px-4 py-2 border-t bg-muted/30">
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        {projects.length} result{projects.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </CommandGroup>
                        )}

                        {!hasSearched && searchTerm.length === 0 && (
                            <div className="px-4 py-6 text-center">
                                <Folder className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    Type to search for projects
                                </p>
                            </div>
                        )}
                    </CommandList>
                </Command>

                {selectedProject && (
                    <div className="border-t p-2 bg-muted/20">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-destructive justify-center"
                            onClick={handleClear}
                        >
                            Clear selection
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};