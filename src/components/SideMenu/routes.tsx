import homeIcon from '~/assets/images/home.svg';
import drawerIcon from '~/assets/images/drawer.svg';
import userIcon from '~/assets/images/user.svg';
import gearIcon from '~/assets/images/gear.svg';
import folderIcon from '~/assets/images/folder.svg';

interface ItemSide {
  key: string;
  name: string;
  icon?: string;
  route: string;
  matches: string;
  sub?: ItemSide[];
}

export const adminRoutes: ItemSide[] = [
  {
    key: 'dashboard',
    name: 'Dashboard',
    icon: homeIcon,
    route: '/dashboard',
    matches: 'dashboard',
  },
  {
    key: 'drawer-management',
    name: 'Drawer Management',
    icon: drawerIcon,
    route: '/drawer-management',
    matches: 'drawer-management',
  },
  {
    key: 'user-management',
    name: 'User Management',
    icon: userIcon,
    route: '/user-management',
    matches: 'user-management',
  },
  {
    key: 'settings',
    name: 'Settings',
    icon: gearIcon,
    route: '/settings',
    matches: 'settings',
    sub: [
      {
        key: 'database-settings',
        name: 'Database Settings',
        route: '/settings/database-settings',
        matches: 'database-settings',
      },

      {
        key: 'preferences-settings',
        name: 'Preferences Settings',
        route: '/settings/preferences-settings',
        matches: 'preferences-settings',
      },
      {
        key: 'account-settings',
        name: 'Account Settings',
        route: '/settings/account-settings',
        matches: 'account-settings',
      },
    ],
  },
];

export const clientRoutes: ItemSide[] = [
  // {
  //   key: 'search',
  //   name: 'Search',
  //   icon: searchIcon,
  //   route: '/search',
  //   matches: 'search',
  // },
  {
    key: 'folder-management',
    name: 'Folder Management',
    icon: folderIcon,
    route: '/folder-management',
    matches: 'folder-management',
  },
  {
    key: 'settings',
    name: 'Settings',
    icon: gearIcon,
    route: '/settings',
    matches: 'settings',
    sub: [
      {
        key: 'account-settings',
        name: 'Account Settings',
        route: '/settings/account-client-settings',
        matches: 'account-client-settings',
      },
      // {
      //   key: 'preferences-settings',
      //   name: 'Preferences Settings',
      //   route: '/settings/preferences-client-settings',
      //   matches: 'preferences-settings',
      // },
      {
        key: 'scanner-settings',
        name: 'Scanner Settings',
        route: '/settings/scanner-settings',
        matches: 'scanner-settings',
      },
    ],
  },
];
