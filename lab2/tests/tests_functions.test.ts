import { retryOperation, fetchUserProfiles, processInBatches, raceWithTimeout } from '../src/index';

describe('fetchUserProfiles()', () => {
    it('має повернути порожній масив якщо передано порожній ID', async () => {
       const input: string[] = [];

       const result = await fetchUserProfiles(input);
       expect(result).toEqual([]);
    });

    it('має повернути коректно сформовані профілі для декількох ID', async () => {
       const id = ['1', '2'];

       const result = await fetchUserProfiles(id);
       expect(result).toHaveLength(2);

       expect(result[0]).toEqual({
           id: '1',
           name: 'User 1',
           email: '1@example.com',
       });
    });

    it('Кожен профіль має містити коректний email відповідно до ID', async () => {
        const id = ['test-user'];
        const [user] = await fetchUserProfiles(id);

        expect(user.email).toBe('test-user@example.com');
    });
});



describe('retryOperation()', () => {
    it('Вдала операція з першої спроби', async () => {
        let attempts = 0;

        const mockOp = async () => {
            attempts++;
            if (attempts < 2) throw new Error('Помилка');
            return "Успіх";
        };

        const result = await retryOperation(mockOp, 3);
        expect(result).toBe("Успіх");
        expect(attempts).toBe(2);
    });

    it('Помилка якщо всі спроби вичерпано', async () => {
        const failingOp = async () => { throw new Error('Нічого не вийде');};
        await expect(retryOperation(failingOp, 2))
            .rejects
            .toThrow("Всі спроби вичерпано");
    });

    it('має повернути успіх з 3 спроби', async () => {
       let attempts = 0;

       const mockOp = async () => {
           attempts++;
           if(attempts < 3) throw new Error('тимчасова помилка');
           return 'Успіх';
       };
       const result = await retryOperation(mockOp, 5);

       expect(result).toBe('Успіх');
       expect(attempts).toBe(3);
    });
});

describe('processInBatches()', () => {
   it('Повинен обробляти масив чисел частинами', async () => {
       const input = [1, 2, 3, 4];
       const batchSize = 2;

       const mockProcessor =
           async (batch: number[])=> batch.map(n => n * 10);

       const result = await processInBatches(input, batchSize, mockProcessor);

       expect(result). toEqual([10, 20, 30, 40]);
   });

   it('Повинен обробляти масив рядків' , async () => {
      const  input = ["a", "b"];

      const mockProcessor =
          async (batch: string[]) => batch.map(s => s.toUpperCase());

      const result = await processInBatches(input, 1, mockProcessor);

      expect(result).toEqual(["A", "B"]);
   });

   it('має трансформувати типи даних з number до string', async () => {
      const  input = [1, 2, 3];

      const mockProcessor = async (batch: number[])=>
          batch.map(n => `ID: ${n}`);

      const result = await processInBatches(input, 2, mockProcessor);

      expect(result).toEqual(["ID: 1", "ID: 2", "ID: 3"]);
   });
});


describe('raceWithTimeout()', () => {
   it('результат якщо операція встигла', async () => {
      const fastPromise = new Promise(resolve =>
          setTimeout(() => resolve('Встиг'), 50));

      const result = await raceWithTimeout(fastPromise, 100);

      expect(result).toBe('Встиг');
   });

   it('Викине помилку якщо час вийшов', async () => {
      const slowPromise = new Promise(resolve =>
      setTimeout(() => resolve('Не встиг'), 200));

      await expect(raceWithTimeout(slowPromise, 100))
          .rejects
          .toThrow('Operation timed out after 100ms');
   });
});