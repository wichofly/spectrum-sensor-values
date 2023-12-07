import { useState } from 'react';

const JokeGenerator = () => {
  const [joke, setJoke] = useState('');

  const generateJoke = async () => {
    const config = {
      headers: {
        Accept: 'application/json',
      },
    };

    const res = await fetch('https://icanhazdadjoke.com', config);
    const data = await res.json();
    setJoke(data.joke);
  };

  return (
    <div>
      <button onClick={generateJoke}>Generate Joke</button>
      <p>{joke}</p>
    </div>
  );
};

export default JokeGenerator;
