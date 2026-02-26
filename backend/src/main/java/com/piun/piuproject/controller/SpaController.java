package com.piun.piuproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    
    @GetMapping(value = {"/", "/login", "/dashboard", "/projects", "/projects/**", "/donors", "/donors/**", 
                         "/issues", "/issues/**", "/kpi", "/kpi/**", "/users", "/users/**", "/settings", "/profile",
                         "/setup", "/financial", "/monitoring", "/project-actions", "/social-environmental",
                         "/documentation", "/map", "/administration", "/administration/**", "/change-password"})
    public String forward() {
        return "forward:/index.html";
    }
}
