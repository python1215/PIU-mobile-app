package com.piun.piuproject.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    
    @GetMapping(value = {"/", "/login", "/dashboard", "/projects", "/projects/**", "/donors", "/donors/**", 
                         "/issues", "/issues/**", "/kpi", "/kpi/**", "/users", "/users/**", "/settings", "/profile"})
    public String forward() {
        return "forward:/index.html";
    }
}
