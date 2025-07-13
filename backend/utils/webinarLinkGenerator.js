function generateWebinarLinks(webinarId) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return {
      attendee_link: `${baseUrl}/join/${webinarId}?role=attendee`,
      presenter_link: `${baseUrl}/join/${webinarId}?role=presenter`
    };
  }
  