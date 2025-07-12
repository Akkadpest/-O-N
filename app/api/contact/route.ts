import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/server/storage'
import { insertContactRequestSchema } from '@/shared/schema'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = insertContactRequestSchema.parse(body)
    const contactRequest = await storage.createContactRequest(validatedData)
    
    // In a real application, you would send an email here
    console.log("New contact request received:", contactRequest)
    
    return NextResponse.json({ 
      success: true, 
      message: "Thank you for your inquiry! We will contact you soon.",
      id: contactRequest.id 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: "Please fill in all required fields correctly.",
        errors: error.errors 
      }, { status: 400 })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "An error occurred while processing your request. Please try again." 
      }, { status: 500 })
    }
  }
}

export async function GET() {
  try {
    const requests = await storage.getContactRequests()
    return NextResponse.json({ success: true, data: requests })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to retrieve contact requests." 
    }, { status: 500 })
  }
}