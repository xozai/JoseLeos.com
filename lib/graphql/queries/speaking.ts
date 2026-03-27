import { gql } from "@apollo/client";

export const GET_SPEAKING_EVENTS = gql`
  query GetSpeakingEvents {
    speakingEvents(first: 100) {
      nodes {
        slug
        title
        speakingFields {
          eventName
          eventDate
          eventUrl
          location
          talkTitle
          slidesUrl
          videoUrl
          description
        }
        acfVisibility {
          visibility
        }
      }
    }
  }
`;
