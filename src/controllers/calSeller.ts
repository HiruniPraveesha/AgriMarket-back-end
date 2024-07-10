import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import moment from 'moment';

const prisma = new PrismaClient();

// Controller function to handle POST request for creating a new calendar event
export const createCalendarEvent = async (req: Request, res: Response) => {
  const { categoryId, productId, note, start, sellerId } = req.body;

  const startDateTime = moment(start).format('YYYY-MM-DD HH:mm:ss');

  try {
    const newEvent = await prisma.calendarEvents.create({
      data: {
        categoryId: parseInt(categoryId),
        productId: parseInt(productId),
        note,
        start: new Date(startDateTime),
        sellerId: parseInt(sellerId),
      },
    });

    res.status(200).json({ message: 'Event inserted successfully', eventId: newEvent.event_id });
  } catch (error) {
    console.error('Error inserting event:', error);
    res.status(500).json({ error: 'Error inserting event' });
  }
};

// Controller function to handle PUT request for updating an existing calendar event
export const updateCalendarEvent = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.event_id); // Parse eventId from string to number
  const { categoryId, productId, note, start, sellerId } = req.body;

  const startDateTime = moment(start).format('YYYY-MM-DD HH:mm:ss');

  try {
    const updatedEvent = await prisma.calendarEvents.update({
      where: { event_id: eventId }, // Specify the correct field and value for the unique identifier
      data: {
        categoryId: parseInt(categoryId),
        productId: parseInt(productId),
        note,
        start: new Date(startDateTime),
        sellerId: parseInt(sellerId),
      },
    });

    res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Error updating event' });
  }
};

// Controller function to handle DELETE request for deleting a calendar event
export const deleteCalendarEvent = async (req: Request, res: Response) => {
  const eventId = parseInt(req.params.event_id); // Parse eventId from string to number

  try {
    await prisma.calendarEvents.delete({
      where: { event_id: eventId }, // Specify the correct field and value for the unique identifier
    });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Error deleting event' });
  }
};


// Controller function to handle GET request for fetching calendar events for a specific seller
export const getCalendarEventsBySeller = async (req: Request, res: Response) => {
  const sellerId = parseInt(req.params.sellerId); // Convert sellerId to integer

  try {
    const events = await prisma.calendarEvents.findMany({
      where: {
        sellerId: sellerId,
      },
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Error fetching events' });
  }
};


// Get event by ID
export const getEventById = async (req: Request, res: Response) => {
  const event_id = parseInt(req.params.event_id);

  try {
    const event = await prisma.calendarEvents.findUnique({
      where: { event_id: event_id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};