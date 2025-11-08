package iuh.backend.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import iuh.backend.model.Device;
import iuh.backend.repository.DeviceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final DeviceRepository deviceRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader("X-API-KEY");

        if (apiKey == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Optional<Device> deviceOptional = deviceRepository.findByApiKey(apiKey);

        if (deviceOptional.isPresent()) {
            Device device = deviceOptional.get();
            System.out.println("API Key valid for device: " + device.getId() + ", factory: " + (device.getFactory() != null ? device.getFactory().getId() : "null"));
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    device, null, new ArrayList<>());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Set tenant context for multi-tenancy
            if (device.getFactory() != null) {
                TenantContext.setTenantId(device.getFactory().getId());
            }
        } else {
            System.out.println("Invalid API key: " + apiKey);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clear tenant context after request processing
            TenantContext.clear();
        }
    }
}