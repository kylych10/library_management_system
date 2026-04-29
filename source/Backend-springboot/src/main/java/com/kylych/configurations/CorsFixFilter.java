package com.kylych.configurations;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Highest-priority filter that injects CORS headers into every response
 * before Spring Security or any other filter runs.
 * This ensures CORS headers are present even on error responses.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFixFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request   = (HttpServletRequest)  req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");

        // Only allow known origins
        if (origin != null && (
                origin.equals("https://kylychlibrary.netlify.app") ||
                origin.equals("http://localhost:5173") ||
                origin.equals("http://localhost:3000") ||
                origin.equals("http://localhost:5174") || origin.equals("https://kitep.space")
        )) {
            response.setHeader("Access-Control-Allow-Origin",  origin);
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "*");
            response.setHeader("Access-Control-Expose-Headers", "Authorization");
            response.setHeader("Access-Control-Max-Age", "3600");
        }

        // Handle preflight immediately — don't pass to the rest of the chain
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }
}
