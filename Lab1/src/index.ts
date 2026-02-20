function delay(ms: number) : Promise<void>{
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
}

function fetchUserProfiles(userIds: string[]) : Promise<UserProfile[]> {

    if(userIds.length === 0){
        return Promise.resolve([]);
    }
    const promises = userIds.map(id => {
        return new Promise<UserProfile>((resolve) => {
            let min: number = 50;
            let max: number = 150;
            const delayTime = Math.floor(Math.random() * (max - min + 1) + min);

            setTimeout(() =>{
                resolve({
                    id: id,
                    name: `User ${id}`,
                    email: `${id}@example.com`,
                });
            }, delayTime);
        });
    });
    return Promise.all(promises);
}


async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        console.log(`спроба ${i}`);
        try{
            return await operation();
        }catch (error){
            console.log("Помилка. Чекаємо...");
            await delay(100);
        }
    }
    throw new Error("Всі спроби вичерпано");
}


async function processInBatches(
    items: number[],
    batchSize: number,
    processor: (batch: number[]) => Promise<number[]>
): Promise<number[]> {
    const results: number[] = [];
    const totalBatches = Math.ceil(items.length / batchSize);
    let currentBatchNum = 0;

    for (let i = 0; i < items.length; i += batchSize) {
        currentBatchNum++;

        const batch = items.slice(i, i + batchSize);

        console.log(`Обробка партії ${currentBatchNum}/${totalBatches}`);

        const processedBatch = await processor(batch);
        results.push(...processedBatch);
    }
    return results;
}

function raceWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject( new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}


async function main(){
    console.log("Функція delay\n")
    console.log("Початок програми.");
    await delay(1000);
    console.log("Готово затримка завершилась");


    console.log("\nФункція fetchUserProfiles\n")
    console.log("Старт завантаження");
    const users = await fetchUserProfiles(["user1", "user2", "user3"]);
    console.log(users);

    console.log("\nФункція retryOperation\n");
    let attempts = 0;

    const unreliableOperation = async (): Promise<string> => {
        attempts++;
        if (attempts < 3) {
            throw new Error("Тимчасова помилка");
        }
        return "Успіх";
    };

    try{
        const result = await retryOperation(unreliableOperation, 3);
        console.log(`Результат: ${result}`);
    }catch (error){
        console.error("Операція провалилась остаточно");
    }

    console.log("\nФункція processInBatches\n");

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    const  myProcessor = async (batch: number[]): Promise<number[]> => {
        await delay(1000);
        return batch.map(n => n * 2);
    };

    const result = await processInBatches(numbers, 3, myProcessor);
    console.log('Результат: ', result);

    console.log("\nФункція raceWithTimeout\n");

    const fast = delay(50).then(() => "встиг");
    try{
        const result = await raceWithTimeout(fast, 100);
        console.log("Результат1: ", result);
    }
    catch(error){
        console.log("Помилка1: ", error);
    }

    const slow = delay(200).then(() => "Повільний");
    try{
        await raceWithTimeout(slow, 100);
    }catch (error){
        if(error instanceof Error){
            console.error("Помилка2: ", error.message);
            console.log("Час вийшов", error.message);
        }
    }
}

main();

