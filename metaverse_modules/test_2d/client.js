import io from 'socket.io-client';

export class client {
  static instance;
  localClientId = null;
  socket = null;

  constructor(
    spawn_player,
    despawn_remote_player,
    despawn_all_remote_players,
    move,
  ) {
    client.instance = this;

    this.socket = io('http://localhost:3000');
    this.socket.on('connect', () => {
      console.log('connected to server');
    });
    this.socket.on('message', message => {
      const type = message.type;
      const content = message.content;

      if (type === 'connection') {
        console.log('connection message received', content);
        this.localClientId = content.clientId;
      } else if (type === 'remote_connection') {
        spawn_player(content.clientId);
        console.log('remote_connection message received', content);
      } else if (type === 'movement') {
        if (content.clientId !== this.localClientId) {
          //console.log('movement message received', content);
          move(content.clientId, content.x, content.y, content.z);
        }
      }
    });
    this.socket.on('disconnect', () => {
      despawn_all_remote_players();
      console.log('disconnected from server');
    });
    this.socket.on('disconnection', data => {
      despawn_remote_player(data.clientId);
      console.log('disconnected from server', data);
    });
  }

  sendMovement(x, y, z) {
    const message = {
      type: 'movement',
      content: {
        x,
        y,
        z,
      },
    };
    this.socket.emit('message', message);
  }
}
