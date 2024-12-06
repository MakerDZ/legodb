'use server';

import { prisma } from '@/lib/prisma';
import { TypeWebHook } from '@/validation/WebHook';

export async function createWebHook(input: TypeWebHook) {
    try {
        const webhook = await prisma.webHook.create({
            data: {
                name: input.name,
                webUrl: input.webUrl,
                tableAccess: input.tableAccess,
            },
        });

        return webhook;
    } catch (error) {
        console.error('Error creating WebHook :', error);
        throw new Error('Could not create WebHook');
    }
}

export async function deleteWebHook(id: string) {
    try {
        const deleted = await prisma.webHook.delete({
            where: {
                id: id,
            },
        });

        return deleted;
    } catch (error) {
        console.error('Error deleteing  WebHook :', error);
        throw new Error('Could not delete WebHook');
    }
}

export async function getWebHookData() {
    try {
        const webHooKLists = await prisma.webHook.findMany();
        return webHooKLists;
    } catch (error) {
        console.error('Error getting WebHook :', error);
        throw new Error('Could not get WebHooks');
    }
}

export async function sendWebhookNotification(url: string, data: any) {
    try {
        console.log('webhook');
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        console.log(result, url);
    } catch (error) {
        console.error('Failed to send webhook', error);
        // Optionally, save failed webhook to retry later
    }
}