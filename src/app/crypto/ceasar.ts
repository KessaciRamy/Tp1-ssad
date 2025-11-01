
// fonction pour faire la table de caractere
function makeTable(): string[] {
    const table: string[] = [];
    let i;
    for( i= 33; i<= 126; i++) table.push(String.fromCharCode(i));
    return table;
}




export function ceasar_encrypt(text: string, key: number) {
  const table = makeTable();
  if (key % table.length === 0) {
    throw new Error("Mauvais choix de clé");
  }
  const words = text.split(" ");
  const encryptedWords: string[] = [];
  for (const word of words){
    let encrypted = "";
    for (const ch of word){
    const idx = table.indexOf(ch);
    if( idx === -1){
      encrypted += ch;
      continue;
    }
    const newIdx = (idx + key) % table.length;
    encrypted += table[newIdx];
    
  }
  encryptedWords.push(encrypted);
}
  return encryptedWords.join(" ");
}

// --- Déchiffrement César --- //
export function ceasar_decrypt(text: string, key: number) {
  const table = makeTable(); // même table que pour le chiffrement
  const words = text.split(" ");
  const decryptedWords: string[] = [];

  for (const word of words) {
    let decrypted = "";

    for (const ch of word) {
      const idx = table.indexOf(ch);

      if (idx === -1) {
        // si le caractère n'est pas dans la table (ex: espace, ponctuation)
        decrypted += ch;
        continue;
      }

      // on fait le décalage inverse (soustraction)
      const newIdx = (idx - key + table.length) % table.length;
      decrypted += table[newIdx];
    }

    decryptedWords.push(decrypted);
  }

  return decryptedWords.join(" ");
}


