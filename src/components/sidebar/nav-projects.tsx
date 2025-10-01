// src/components/sidebar/nav-projects.tsx
'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Folder,
  type LucideIcon,
  MoreHorizontal,
  Pencil,
  Trash2
} from 'lucide-react'

import { deleteProjectAction } from '@/app/(private)/projects/actions/deleteProjectAction'
import { toastRes } from '@/components/toast-result'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'

type Project = {
  name: string
  url: string
  icon: LucideIcon
  id?: string
}

function ProjectMenuItem({ project }: { project: Project }) {
  const { isMobile } = useSidebar()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  // Extract project ID from URL (/projects/[id])
  const projectId = project.id || project.url.split('/').pop() || ''

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProjectAction(projectId)

      toastRes(result, {
        success: 'Project deleted successfully.',
        errors: {
          UNAUTHORIZED: 'You do not have permission to delete this project.',
          NOT_FOUND: 'Project not found.'
        }
      })

      if (result.ok) {
        setDeleteDialogOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{project.name}</strong>?
              This will permanently remove all environments and secrets. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pending ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidebarMenuItem key={project.name}>
        <SidebarMenuButton asChild>
          <a href={project.url}>
            <project.icon />
            <span>{project.name}</span>
          </a>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction>
              <MoreHorizontal />
              <span className="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'end' : 'start'}
          >
            <DropdownMenuItem asChild>
              <a href={project.url}>
                <Folder className="text-muted-foreground" />
                <span>View Project</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`${project.url}/settings`}>
                <Pencil className="text-muted-foreground" />
                <span>Edit Project</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="text-destructive" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </>
  )
}

export function NavProjects({ projects }: { projects: Project[] }) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map(item => (
          <ProjectMenuItem key={item.name} project={item} />
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
