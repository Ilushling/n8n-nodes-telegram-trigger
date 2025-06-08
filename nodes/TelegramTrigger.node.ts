import {
  ITriggerFunctions
} from 'n8n-workflow';

import {
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  UnexpectedError,
  NodeConnectionType
} from 'n8n-workflow';
import { ApiResponse, Update } from 'typegram';

export class TelegramTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Telegram Trigger',
    name: 'telegramTrigger',
    icon: 'file:telegram.svg',
    group: ['trigger'],
    version: 1,
    description: 'Starts the workflow on a Telegram update on polling',
    defaults: {
      name: 'Telegram Trigger'
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'telegramApi',
        required: true
      }
    ],
    properties: [
      {
        displayName: 'Updates',
        name: 'updates',
        type: 'multiOptions',
        // Source: https://core.telegram.org/bots/api#update
        options: [
          {
            name: '*',
            value: '*',
            description: 'All updates.'
          },

          {
            name: 'Message',
            value: 'message',
            description: 'New incoming message of any kind - text, photo, sticker, etc.'
          },
          {
            name: 'Edited Message',
            value: 'edited_message',
            description: 'New version of a message that is known to the bot and was edited. This update may at times be triggered by changes to message fields that are either unavailable or not actively used by your bot.'
          },

          {
            name: 'Channel Post',
            value: 'channel_post',
            description: 'New incoming channel post of any kind - text, photo, sticker, etc.'
          },
          {
            name: 'Edited Channel Post',
            value: 'edited_channel_post',
            description: 'New version of a channel post that is known to the bot and was edited. This update may at times be triggered by changes to message fields that are either unavailable or not actively used by your bot.'
          },

          {
            name: 'Business Connection',
            value: 'business_connection',
            description: 'The bot was connected to or disconnected from a business account, or a user edited an existing connection with the bot.'
          },

          {
            name: 'Business Message',
            value: 'business_message',
            description: 'New message from a connected business account.'
          },
          {
            name: 'Edited Business Message',
            value: 'edited_business_message',
            description: 'New version of a message from a connected business account.'
          },
          {
            name: 'Deleted BusinessMessage',
            value: 'deleted_business_messages',
            description: 'Messages were deleted from a connected business account.'
          },

          {
            name: 'Message Reaction',
            value: 'message_reaction',
            description: 'A reaction to a message was changed by a user. The bot must be an administrator in the chat and must explicitly specify "message_reaction" in the list of allowed_updates to receive these updates. The update isn\'t received for reactions set by bots.'
          },
          {
            name: 'Message Reaction Count',
            value: 'message_reaction_count',
            description: 'Reactions to a message with anonymous reactions were changed. The bot must be an administrator in the chat and must explicitly specify "message_reaction_count" in the list of allowed_updates to receive these updates. The updates are grouped and can be sent with delay up to a few minutes.'
          },
          {
            name: 'Inline Query',
            value: 'inline_query',
            description: 'New incoming inline query.'
          },
          {
            name: 'Chosen Inline Result',
            value: 'chosen_inline_result',
            description: 'The result of an inline query that was chosen by a user and sent to their chat partner. Please see our documentation on the feedback collecting for details on how to enable these updates for your bot.'
          },
          {
            name: 'Callback Query',
            value: 'callback_query',
            description: 'New incoming callback query.'
          },
          {
            name: 'Shipping Query',
            value: 'shipping_query',
            description: 'New incoming shipping query. Only for invoices with flexible price.'
          },
          {
            name: 'Pre-Checkout Query',
            value: 'pre_checkout_query',
            description: 'New incoming pre-checkout query. Contains full information about checkout.'
          },

          {
            name: 'Purchased Paid Media',
            value: 'purchased_paid_media',
            description: 'A user purchased paid media with a non-empty payload sent by the bot in a non-channel chat.'
          },

          {
            name: 'Poll',
            value: 'poll',
            description: 'New poll state. Bots receive only updates about manually stopped polls and polls, which are sent by the bot.'
          },
          {
            name: 'Poll Answer',
            value: 'poll_answer',
            description: 'A user changed their answer in a non-anonymous poll. Bots receive new votes only in polls that were sent by the bot itself.'
          },

          {
            name: 'Bot Chat Member Updated',
            value: 'my_chat_member',
            description: 'The bot\'s chat member status was updated in a chat. For private chats, this update is received only when the bot is blocked or unblocked by the user.'
          },
          {
            name: 'User Chat Member Updated',
            value: 'chat_member',
            description: 'A chat member\'s status was updated in a chat. The bot must be an administrator in the chat and must explicitly specify "chat_member" in the list of allowed_updates to receive these updates.'
          },
          {
            name: 'Chat Join Request',
            value: 'chat_join_request',
            description: 'A request to join the chat has been sent. The bot must have the can_invite_users administrator right in the chat to receive these updates.'
          },

          {
            name: 'Chat Boost',
            value: 'chat_boost',
            description: 'A chat boost was added or changed. The bot must be an administrator in the chat to receive these updates.'
          },
          {
            name: 'Removed Chat Boost',
            value: 'removed_chat_boost',
            description: 'A boost was removed from a chat. The bot must be an administrator in the chat to receive these updates.'
          }
        ],
        required: true,
        default: ['*'],
        description: `List of the update types you want your bot to receive. For example, specify ["message", "edited_channel_post", "callback_query"] to only receive updates of these types. See Update for a complete list of available update types. Specify an empty list to receive all update types except chat_member, message_reaction, and message_reaction_count (default). If not specified, the previous setting will be used.

        Please note that this parameter doesn't affect updates created before the call to getUpdates, so unwanted updates may be received for a short period of time.`
      },
      {
        displayName: 'Offset',
        name: 'offset',
        type: 'number',
        default: 0,
        description: 'Identifier of the first update to be returned. Must be greater by one than the highest among the identifiers of previously received updates. By default, updates starting with the earliest unconfirmed update are returned. An update is considered confirmed as soon as getUpdates is called with an offset higher than its update_id. The negative offset can be specified to retrieve updates starting from -offset update from the end of the updates queue. All previous updates will be forgotten.',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        typeOptions: {
          minValue: 1
        },
        default: 100,
        description: 'Limits the number of updates to be retrieved. Values between 1-100 are accepted. Defaults to 100.'
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        typeOptions: {
          minValue: 0
        },
        default: 60,
        description: 'Timeout in seconds for long polling. Defaults to 0, i.e. usual short polling. Should be positive, short polling should be used for testing purposes only.'
      },
      {
        displayName: 'Origin',
        name: 'origin',
        type: 'string',
        default: 'https://api.telegram.org',
        description: 'Telegram origin. Example https://api.telegram.org'
      }
    ]
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const context = { isPolling: true, offset: 0 };

    const credentials = await this.getCredentials('telegramApi');

    /** number */
    let offset = this.getNodeParameter('offset');
    /** number */
    const limit = this.getNodeParameter('limit');
    /** number */
    const timeout = this.getNodeParameter('timeout');

    /** string[] */
    const allowedUpdatesParameter = this.getNodeParameter('updates');

    if (typeof offset !== 'number') {
      throw new UnexpectedError('Offset is not number');
    }
    if (typeof limit !== 'number') {
      throw new UnexpectedError('Limit is not number');
    }
    if (typeof timeout !== 'number') {
      throw new UnexpectedError('Timeout is not number');
    }
    if (!Array.isArray(allowedUpdatesParameter)) {
      throw new UnexpectedError('updates is not array');
    }

    let allowedUpdates: string[];
    if (allowedUpdatesParameter.includes('*')) {
      allowedUpdates = [];
    }

    const origin = credentials.baseUrl;

    context.isPolling = true;

    const abortController = new AbortController();

    const start = async () => {
      context.offset = 0;

      while (context.isPolling) {
        const offset = context.offset;

        let response: ApiResponse<Update[]>;
        try {
          response = await this.helpers.request({
            uri: `${origin}/bot${credentials.accessToken}/getUpdates`,
            method: 'POST',
            body: {
              offset,
              limit,
              timeout,
              allowed_updates: allowedUpdates
            },
            json: true,
            timeout: 0
          });
        } catch (error) {
          if (
            typeof error === 'object'
            && error != null
            && 'response' in error
            && typeof error.response === 'object'
            && error.response != null
            && 'status' in error.response
          ) {
            if (error.response?.status === 409 && context.isPolling !== true) {
              // 409 status happens on save changes.
              // Because disable and enable which call closeFunction()
              // isPolling responsible for execution flag correlated with 409 code
              console.debug('409 status - execution is stopping');
              // Ignore error
              continue;
            }
          }

          throw error;
        }

        if (!response.ok) {
          continue;
        }

        if (response.result == null) {
          continue;
        }

        const updates = response.result;
        const updateCount = updates.length;

        if (updateCount === 0) {
          continue;
        }

        const lastUpdate = updates[updateCount - 1];
        const lastUpdateId = lastUpdate.update_id;

        context.offset = lastUpdateId + 1;

        let filteredUpdates = updates;

        if (allowedUpdates.length > 0) {
          filteredUpdates = updates.reduce((acc, update) => {
            if (allowedUpdates.some(allowedUpdate => allowedUpdate in update)) {
              acc.push(update);
            }

            return acc;
          }, [] as Update[]);
        }

        this.emit([this.helpers.returnJsonArray({ json: filteredUpdates })]);
      }
    };

    const closeFunction = async () => {
      context.isPolling = false;
      abortController.abort();
    };

    start();

    return { closeFunction };
  }
}
