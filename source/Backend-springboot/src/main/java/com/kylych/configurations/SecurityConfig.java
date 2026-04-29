package com.kylych.configurations;

import com.kylych.oauth2.CustomOAuth2UserService;
import com.kylych.oauth2.OAuth2LoginSuccessHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;


@Configuration
public class SecurityConfig {

	@Autowired
	private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

	@Autowired
	private CustomOAuth2UserService customOAuth2UserService;

	@Autowired
	private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

		return http.sessionManagement(management -> management.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(Authorize -> Authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/auth/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/books/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/genres/**").permitAll()
						.requestMatchers("/api/**").authenticated()
						.requestMatchers("/api/super-admin/**").hasRole("ADMIN")
						.anyRequest().permitAll())
				.oauth2Login(oauth2 -> oauth2
						.userInfoEndpoint(userInfo -> userInfo
								.userService(customOAuth2UserService))
						.successHandler(oAuth2LoginSuccessHandler))
				.addFilterBefore(new JwtValidator(), BasicAuthenticationFilter.class)
				.csrf(AbstractHttpConfigurer::disable)
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.exceptionHandling(
						exceptionHandler -> exceptionHandler
								.authenticationEntryPoint(customAuthenticationEntryPoint))
				.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	/**
	 * Primary CorsFilter bean — runs before Spring Security so CORS headers
	 * are always present even when the backend returns a 4xx/5xx error.
	 */
	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration cfg = buildCorsConfiguration();
		source.registerCorsConfiguration("/**", cfg);
		return new CorsFilter(source);
	}

	private CorsConfigurationSource corsConfigurationSource() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", buildCorsConfiguration());
		return source;
	}

	private CorsConfiguration buildCorsConfiguration() {
		CorsConfiguration cfg = new CorsConfiguration();

		cfg.setAllowedOrigins(Arrays.asList(
				"http://localhost:3000",
				"http://localhost:5173",
				"http://localhost:5174",
				"https://kylychlibrary.netlify.app"
		));

		cfg.setAllowedMethods(Arrays.asList(
				"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
		));

		cfg.setAllowedHeaders(List.of("*"));

		cfg.setAllowCredentials(true);

		cfg.setExposedHeaders(Arrays.asList("Authorization"));

		cfg.setMaxAge(3600L);

		return cfg;
	}

}
