export interface SellerSessionData {
    
        email: string;
        OTP: string;
        otpExpiresAt: Date;
        password: string;
        emailVerified?: boolean;
    
}