import { Platform } from 'react-native';

// No navegador (web), "localhost" já aponta pro computador que roda o
// servidor. No celular via Expo Go, "localhost" apontaria pro próprio
// celular — por isso usamos o IP da máquina na rede Wi-Fi local.
// Se esse IP mudar (rede diferente, reinício do roteador), atualize aqui.
const LAN_IP = '192.168.15.26';
const PORT = 4001;

export const SERVER_URL = Platform.OS === 'web' ? `http://localhost:${PORT}` : `http://${LAN_IP}:${PORT}`;
