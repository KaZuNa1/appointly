import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './db';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
          include: { providerProfile: true }
        });

        if (user) {
          // User exists, return user
          return done(null, user);
        }

        // Check if user exists with this email (from local registration)
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails![0].value },
          include: { providerProfile: true }
        });

        if (existingUser) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: profile.id,
              provider: 'GOOGLE',
              emailVerified: true, // Google emails are verified
              avatarUrl: profile.photos?.[0]?.value || existingUser.avatarUrl
            },
            include: { providerProfile: true }
          });
          return done(null, user);
        }

        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails![0].value,
            fullName: profile.displayName,
            googleId: profile.id,
            provider: 'GOOGLE',
            emailVerified: true, // Google emails are pre-verified
            avatarUrl: profile.photos?.[0]?.value
          },
          include: { providerProfile: true }
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { providerProfile: true }
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
