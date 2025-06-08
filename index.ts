import { INodeType } from 'n8n-workflow';
import { TelegramTrigger } from './nodes/TelegramTrigger.node.ts';

export const nodeTypes: INodeType[] = [
  new TelegramTrigger(),
];
