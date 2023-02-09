import { appendFileSync, readFileSync } from 'fs';

try {
  //throw Error('sjnfaosfnaosdfnadfoin');

  const result = readFileSync('./errors.log');
  console.log(result.toString().split('Error'));
} catch (err) {
  appendFileSync('./errors.log', 'Error: StatusCode=403: Message: asdasdasd', {
    encoding: 'utf-8',
  });
}
