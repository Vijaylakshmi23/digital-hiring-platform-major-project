package com.digitalhiring.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class HomeController{

    @GetMapping("/")
    public String home() {
        return "Welcome to Digital Hiring Platform...";
    }

    @GetMapping("/about")
    public String about(){
        return "Digital Hiring Platform Backend...";
    }

    @GetMapping("/version")
    public String version(){
        return "version 1.0";
    }
}