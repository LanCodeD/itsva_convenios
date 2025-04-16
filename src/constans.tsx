import { Icon } from '@iconify/react';
import { signOut } from 'next-auth/react'; // Importa signOut
import { SideNavItem } from './types';

// Menú para usuarios regulares
export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Inicio',
    path: '/dashboard',
    icon: <Icon icon="lucide:home" width="24" height="24" />,
  },
  {
    title: 'Servicios',
    path: '/projects',
    icon: <Icon icon="lucide:folder" width="24" height="24" />,
    submenu: true,
    subMenuItems: [
      { title: 'Iniciar Operación', path: '/convenios' },
      { title: 'Historial de Solicitudes', path: '/obtenerc' },
    ],
  },
  {
    title: 'Contactenos',
    path: 'contactar',
    icon: <Icon icon="lucide:user" width="24" height="24" />,
  },
  {
    title: 'Salir',
    path: '#',
    icon: <Icon icon="lucide:log-out" width="24" height="24" />,
    onClick: () => signOut(), 
  },
];

// Menú para administradores
export const ADMIN_SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: <Icon icon="lucide:layout-dashboard" width="24" height="24" />,
  },
  {
    title: 'Gestión de Usuarios',
    path: '/admin/GestionUsuario',
    icon: <Icon icon="lucide:users" width="24" height="24" />,
  },
  {
    title: 'Gestión de Convenios',
    path: '/admin/GestionConvenio',
    icon: <Icon icon="lucide:file" width="24" height="24" />,
  },
  {
    title: 'Salir',
    path: '#',
    icon: <Icon icon="lucide:log-out" width="24" height="24" />,
    onClick: () => signOut(),
  },
];
