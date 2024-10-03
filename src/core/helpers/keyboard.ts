import {
  Button,
  CallbackButton,
  ChatButton,
  InlineKeyboardAttachmentRequest,
  LinkButton,
  RequestContactButton,
  RequestGeoLocationButton,
} from '../network/api';

type MakeExtra<
  T extends Button,
  O extends keyof Omit<T, 'text' | 'type'> | '' = '',
> = Omit<T, 'text' | 'type' | O>;

export const Keyboard = {
  inlineKeyboard: (
    buttons: InlineKeyboardAttachmentRequest['payload']['buttons'],
  ): InlineKeyboardAttachmentRequest => {
    return {
      type: 'inline_keyboard',
      payload: { buttons },
    };
  },
  button: {
    callback: (
      text: string,
      payload: string,
      extra?: MakeExtra<CallbackButton, 'payload'>,
    ): CallbackButton => {
      return {
        type: 'callback', text, payload, ...extra,
      };
    },
    link: (text: string, url: string): LinkButton => {
      return {
        type: 'link', text, url,
      };
    },
    requestContact: (text: string): RequestContactButton => {
      return {
        type: 'request_contact', text,
      };
    },
    requestGeoLocation: (
      text: string,
      extra?: MakeExtra<RequestGeoLocationButton>,
    ): RequestGeoLocationButton => {
      return {
        type: 'request_geo_location', text, ...extra,
      };
    },
    chat: (
      text: string,
      chatTitle: string,
      extra?: MakeExtra<ChatButton, 'chat_title'>,
    ): ChatButton => {
      return {
        type: 'chat', text, chat_title: chatTitle, ...extra,
      };
    },
  },
};
