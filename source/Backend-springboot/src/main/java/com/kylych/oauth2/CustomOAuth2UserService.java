package com.kylych.oauth2;

import com.kylych.domain.AuthProvider;
import com.kylych.domain.UserRole;
import com.kylych.modal.User;
import com.kylych.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        // Process OAuth2 user info
        return processOAuth2User(userRequest, oauth2User);
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oauth2User) {
        // Extract user info from Google
        Map<String, Object> attributes = oauth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        String googleId = (String) attributes.get("sub");

        // Check if user already exists
        User user = userRepository.findByEmail(email);

        if (user == null) {
            // Create new user
            user = createNewUser(email, name, picture, googleId);
        } else {
            // Update existing user
            user = updateExistingUser(user, name, picture, googleId);
        }

        return new OAuth2UserPrincipal(user, oauth2User.getAttributes());
    }

    private User createNewUser(String email, String name, String picture, String googleId) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(name);
        user.setProfileImage(picture);
        user.setGoogleId(googleId);
        user.setAuthProvider(AuthProvider.GOOGLE);
        user.setRole(UserRole.ROLE_USER);
        user.setVerified(true); // Google users are pre-verified
        user.setLastLogin(LocalDateTime.now());

        return userRepository.save(user);
    }

    private User updateExistingUser(User user, String name, String picture, String googleId) {
        if (user.getAuthProvider() == AuthProvider.LOCAL) {
            // First time linking Google to a local account — set provider
            user.setAuthProvider(AuthProvider.GOOGLE);
        }

        // Check BEFORE setting googleId — null means this is their first Google login
        boolean firstGoogleLogin = user.getGoogleId() == null;

        user.setGoogleId(googleId);
        user.setVerified(true);
        user.setLastLogin(LocalDateTime.now());

        // Only overwrite name/picture on first Google login or if they are blank
        if (firstGoogleLogin || user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(name);
        }
        if (firstGoogleLogin || user.getProfileImage() == null || user.getProfileImage().isBlank()) {
            user.setProfileImage(picture);
        }

        return userRepository.save(user);
    }
}
