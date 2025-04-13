import { NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb';  // Import Prisma client

// POST method to save user data to Prisma DB
export async function POST(req: Request) {

     try {
          // Step 1: Parse the incoming JSON request body which contains user data
          const body = await req.json();
          console.log(body)

          // Extract the necessary fields from the request body
          const { email, name, image, emailVerified, phone, role } = body;

          // Step 2: Ensure all necessary fields are provided
          if (!email || !name || !role) {
               return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
          }

          // Step 3: Check if the user already exists by their email
          const existingUser = await prismadb.user.findUnique({
               where: {
                    email: email,
               },
          });

          if (existingUser) {
               return NextResponse.json({ error: 'User already exists' }, { status: 400 });
          }

          // Step 4: Insert the user data into the Prisma User model
          const newUser = await prismadb.user.create({
               data: {
                    email,
                    name,
                    image: image || '',  // If no image, default to empty string
                    emailVerified: emailVerified || false,  // Default to false if not provided
                    phone: phone || null,  // If no phone, set as null
                    role: role || 'CUSTOMER',  // Default to 'CUSTOMER' if role is not provided
                    password: '',  // Assuming no password is needed since Clerk handles it
               },
          });
          console.log(newUser);

          // Step 5: Return a successful response with the created user data
          return NextResponse.json({ message: 'User created successfully', user: newUser });
     } catch (error) {
          // TypeScript expects 'error' to be of type 'unknown', so we need to handle it properly
          if (error instanceof Error) {
               return NextResponse.json({ error: 'Something went wrong', details: error.message }, { status: 500 });
          } else {
               return NextResponse.json({ error: 'Something went wrong', details: 'Unknown error' }, { status: 500 });
          }
     }
}
