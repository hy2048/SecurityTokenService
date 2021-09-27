namespace SecurityTokenService
{
    public static class Errors
    {
        public const int IdentityTwoFactorIsNotSupported = 4001;
        public const int IdentityUserIsNotAllowed = 4002;
        public const int IdentityUserIsLockedOut = 4003;
        public const int IdentityInvalidCredentials = 4004;
        public const int IdentityNativeClientIsNotSupported = 4005;
        public const int InvalidReturnUrl = 4006;
        public const int ConsentInvalidSelection = 4007;
        public const int ConsentNoScopesMatching = 4008;
        public const int InvalidClientId = 4009;
        public const int NoConsentRequestMatchingRequest = 4010;
        public const int IdentityLoginFailed = 4011;
    }
}