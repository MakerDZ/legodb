import { TypeWebHook } from '@/validation/WebHook';
import { Iauth } from './collection';
import { Restrictet } from '@/utils/handler';
import {
    createWebHook,
    deleteWebHook,
    getWebHookData,
} from '@/data-access/webhook';

export async function createWebHookUseCase(input: TypeWebHook, auth: Iauth) {
    await Restrictet(auth.role);

    const webhook = await createWebHook(input);

    return webhook;
}

export async function deleteWebHookUseCase(id: string, auth: Iauth) {
    await Restrictet(auth.role);

    const deletedWebhook = await deleteWebHook(id);

    return deletedWebhook;
}

export async function getWebHookUseCase() {
    const webHookLists = await getWebHookData();

    return webHookLists;
}
