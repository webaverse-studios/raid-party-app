export const getAssetURL = prompt => {
  if (prompt === 'w_wall') {
    const w_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328357616754728/w.png',
    ];
    return w_walls[Math.floor(Math.random() * w_walls.length)];
  } else if (prompt === 's_wall') {
    const s_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328357235085372/s.png',
    ];
    return s_walls[Math.floor(Math.random() * s_walls.length)];
  } else if (prompt === 'nw_wall') {
    const nw_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328356882759721/nw.png',
    ];
    return nw_walls[Math.floor(Math.random() * nw_walls.length)];
  } else if (prompt === 'ne_wall') {
    const ne_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328356438155285/ne.png',
    ];
    return ne_walls[Math.floor(Math.random() * ne_walls.length)];
  } else if (prompt === 'n_nw_w_wall') {
    const n_nw_w_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328356123594762/n_nw_w.png',
    ];
    return n_nw_w_walls[Math.floor(Math.random() * n_nw_w_walls.length)];
  } else if (prompt === 'w_e_wall') {
    const w_e_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328355783843840/w_e.png',
    ];
    return w_e_walls[Math.floor(Math.random() * w_e_walls.length)];
  } else if (prompt === 'n_wall') {
    const n_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328347361681438/n.png',
    ];
    return n_walls[Math.floor(Math.random() * n_walls.length)];
  } else if (prompt === 'hole') {
    const holes = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328346866745375/hole.png',
    ];
    return holes[Math.floor(Math.random() * holes.length)];
  } else if (prompt === 'ground') {
    const grounds = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328346468294729/ground.png',
    ];
    return grounds[Math.floor(Math.random() * grounds.length)];
  } else if (prompt === 'edge') {
    const edges = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328346065649684/edge.png',
    ];
    return edges[Math.floor(Math.random() * edges.length)];
  } else if (prompt === 'e_wall') {
    const e_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328345600065556/e.png',
    ];
    return e_walls[Math.floor(Math.random() * e_walls.length)];
  } else if (prompt === 'door') {
    const doors = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328344857690162/door.png',
    ];
    return doors[Math.floor(Math.random() * doors.length)];
  } else if (prompt === 'all_wall') {
    const all_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328344455028756/all.png',
    ];
    return all_walls[Math.floor(Math.random() * all_walls.length)];
  } else if (prompt === 'n_ne_e_wall') {
    const n_ne_e_walls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328343926538240/n_ne_e.png',
    ];
    return n_ne_e_walls[Math.floor(Math.random() * n_ne_e_walls.length)];
  } else if (prompt === 'torch') {
    const torches = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328302637817867/torch.png',
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055521896881463387/torch.png',
    ];
    return torches[Math.floor(Math.random() * torches.length)];
  } else if (prompt === 'stones_small') {
    const small_stones = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328302302265364/stones_small.png',
    ];
    return small_stones[Math.floor(Math.random() * small_stones.length)];
  } else if (prompt === 'web_right') {
    const right_webs = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328302025457724/web_right.png',
    ];
    return right_webs[Math.floor(Math.random() * right_webs.length)];
  } else if (prompt === 'web_left') {
    const left_webs = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328301660545065/web_left.png',
    ];
    return left_webs[Math.floor(Math.random() * left_webs.length)];
  } else if (prompt === 'skull') {
    const skulls = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328292621811742/skull.png',
    ];
    return skulls[Math.floor(Math.random() * skulls.length)];
  } else if (prompt === 'peak') {
    const peaks = [
      'https://cdn.discordapp.com/attachments/1046461392913440789/1055521761262841968/Spike_Trap.png',
    ];
    return peaks[Math.floor(Math.random() * peaks.length)];
  } else if (prompt === 'mana_small') {
    const small_manas = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328291694870588/mana_small.png',
    ];
    return small_manas[Math.floor(Math.random() * small_manas.length)];
  } else if (prompt === 'mana_large') {
    const large_manas = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328291376107571/mana_large.png',
    ];
    return large_manas[Math.floor(Math.random() * large_manas.length)];
  } else if (prompt === 'lamp') {
    const lamps = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328290956685322/lamp.png',
    ];
    return lamps[Math.floor(Math.random() * lamps.length)];
  } else if (prompt === 'ladder') {
    const ladders = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328290629517373/ladder.png',
    ];
    return ladders[Math.floor(Math.random() * ladders.length)];
  } else if (prompt === 'key_silver') {
    const silver_keys = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328290252034108/key_silver.png',
    ];
    return silver_keys[Math.floor(Math.random() * silver_keys.length)];
  } else if (prompt === 'stones_large') {
    const large_stones = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328289950052423/stones_large.png',
    ];
    return large_stones[Math.floor(Math.random() * large_stones.length)];
  } else if (prompt === 'health_large') {
    const large_healths = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328262158594098/health_large.png',
    ];
    return large_healths[Math.floor(Math.random() * large_healths.length)];
  } else if (prompt === 'handcuff_1') {
    const handcuffs_1 = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328261764321330/handcuff_2.png',
    ];
    return handcuffs_1[Math.floor(Math.random() * handcuffs_1.length)];
  } else if (prompt === 'handcuff_2') {
    const handcuffs_2 = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328261764321330/handcuff_2.png',
    ];
    return handcuffs_2[Math.floor(Math.random() * handcuffs_2.length)];
  } else if (prompt === 'flag') {
    const flags = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328261093232670/flag.png',
    ];
    return flags[Math.floor(Math.random() * flags.length)];
  } else if (prompt === 'crate_wood') {
    const wood_crates = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328260719935509/crate_wood.png',
    ];
    return wood_crates[Math.floor(Math.random() * wood_crates.length)];
  } else if (prompt === 'crate_silver') {
    const silver_creates = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328260376014879/crate_silver.png',
    ];
    return silver_creates[Math.floor(Math.random() * silver_creates.length)];
  } else if (prompt === 'bone') {
    const bones = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328260074016808/bone.png',
    ];
    return bones[Math.floor(Math.random() * bones.length)];
  } else if (prompt === 'key_gold') {
    const gold_keys = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328259801382943/key_gold.png',
    ];
    return gold_keys[Math.floor(Math.random() * gold_keys.length)];
  } else if (prompt === 'health_small') {
    const small_healths = [
      'https://cdn.discordapp.com/attachments/632242008148148225/1050328259486822420/health_small.png',
    ];
    return small_healths[Math.floor(Math.random() * small_healths.length)];
  }
};
