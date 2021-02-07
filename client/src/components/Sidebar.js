import React from 'react'
import { Link } from 'react-router-dom';

// sidebar components
import { ProSidebar, Menu, MenuItem, SidebarContent, SidebarFooter, SidebarHeader } from 'react-pro-sidebar';
import 'react-pro-sidebar/dist/css/styles.css';

// icons 
import { FaGem, FaHistory } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { BiTestTube } from "react-icons/bi";
import { VscGraph } from 'react-icons/vsc'

function Sidebar() {
  return (
    <ProSidebar 
      collapsed={false} 
      breakPoint="md"
      onToggle={(toggle) => {
        console.log("toggle", toggle);
      }}
      >
      <SidebarHeader>
        
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem icon={<VscGraph />}>
            Dashboard
            <Link to="/" />
          </MenuItem>
          <MenuItem icon={<FaGem />}>
            Strategies
            <Link to="/strategies" />
          </MenuItem>
          <MenuItem icon={<BiTestTube />}>
            Backtesting
            <Link to="/backtesting" />
          </MenuItem>
          <MenuItem icon={<FaHistory />}>
            Trade History
            <Link to="/history" />
          </MenuItem>
          <MenuItem icon={<FiSettings />}>
            Settings
            <Link to="/settings" />
          </MenuItem>
        </Menu>
      </SidebarContent>

      <SidebarFooter>

      </SidebarFooter>
    </ProSidebar>
  );
}

export default Sidebar;


