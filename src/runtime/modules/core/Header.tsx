import React from 'react'

export interface HeaderProps {
  openDrawer: () => void
  isFullscreen: boolean
}

export function Header(props: HeaderProps): JSX.Element {
  return (

    // <AppBar position="static">
    //   <Toolbar>
    //     <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
    //       <MenuIcon onClick={props.openDrawer} />
    //     </IconButton>
    //     <Text variant="h6" component="div" sx={{ flexGrow: 1 }}>
    //       Nessie
    //     </Text>
    //   </Toolbar>
    // </AppBar>
  )
}
