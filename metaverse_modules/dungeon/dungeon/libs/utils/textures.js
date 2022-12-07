import {MonsterType, PropType} from '../generate/index.js';

export const tilesTextures = texture_asset => {
  return {
    '-2': texture_asset.hole.texture,
    '-1': texture_asset.edge.texture,
    0: texture_asset.ground.texture,
    1: texture_asset.s.texture,
    2: texture_asset.s.texture,
    3: texture_asset.s.texture,
    4: texture_asset.s.texture,
    5: texture_asset.s.texture,
    7: texture_asset.s.texture,
    6: texture_asset.s.texture,
    8: texture_asset.s.texture,
    9: texture_asset.s.texture,
    10: texture_asset.s.texture,
    11: texture_asset.s.texture,
    12: texture_asset.s.texture,
    13: texture_asset.w_e.texture,
    14: texture_asset.w_e.texture,
    15: texture_asset.w_e.texture,
    16: texture_asset.w_e.texture,
    17: texture_asset.w_e.texture,
    18: texture_asset.w_e.texture,
    19: texture_asset.w_e.texture,
    20: texture_asset.w_e.texture,
    21: texture_asset.w_e.texture,
    22: texture_asset.w_e.texture,
    23: texture_asset.w_e.texture,
    24: texture_asset.w_e.texture,
    25: texture_asset.w_e.texture,
    26: texture_asset.n_ne_e.texture,
    27: texture_asset.n_ne_e.texture,
    28: texture_asset.e.texture,
    29: texture_asset.n_ne_e.texture,
    30: texture_asset.n_ne_e.texture,
    31: texture_asset.e.texture,
    32: texture_asset.n_ne_e.texture,
    33: texture_asset.e.texture,
    34: texture_asset.n_nw_w.texture,
    35: texture_asset.n_nw_w.texture,
    36: texture_asset.w.texture,
    37: texture_asset.n_nw_w.texture,
    38: texture_asset.n_nw_w.texture,
    39: texture_asset.n_nw_w.texture,
    40: texture_asset.w.texture,
    41: texture_asset.w.texture,
    42: texture_asset.n.texture,
    43: texture_asset.n.texture,
    44: texture_asset.ne.texture,
    45: texture_asset.nw.texture,
    46: texture_asset.all.texture,
    47: texture_asset.s.texture,
    48: texture_asset.door.texture,
  };
};

export const propsTextures = texture_asset => {
  return {
    // Traps
    [`${PropType.Peak}`]: texture_asset.peak.texture,
    // Decor
    [`${PropType.Bone}`]: texture_asset.bone.texture,
    [`${PropType.Flag}`]: texture_asset.flag.texture,
    [`${PropType.CrateSilver}`]: texture_asset.crate_silver.texture,
    [`${PropType.CrateWood}`]: texture_asset.crate_wood.texture,
    [`${PropType.Handcuff1}`]: texture_asset.handcuff_1.texture,
    [`${PropType.Handcuff2}`]: texture_asset.handcuff_2.texture,
    [`${PropType.Lamp}`]: texture_asset.lamp.texture,
    [`${PropType.Skull}`]: texture_asset.skull.texture,
    [`${PropType.StonesLarge}`]: texture_asset.stones_large.texture,
    [`${PropType.StonesSmall}`]: texture_asset.stones_small.texture,
    [`${PropType.Torch}`]: texture_asset.torch.texture,
    [`${PropType.WebLeft}`]: texture_asset.web_left.texture,
    [`${PropType.WebRight}`]: texture_asset.web_right.texture,
    // Items
    [`${PropType.HealthLarge}`]: texture_asset.health_large.texture,
    [`${PropType.HealthSmall}`]: texture_asset.health_small.texture,
    [`${PropType.KeyGold}`]: texture_asset.key_gold.texture,
    [`${PropType.KeySilver}`]: texture_asset.key_silver.texture,
    [`${PropType.ManaLarge}`]: texture_asset.mana_large.texture,
    [`${PropType.ManaSmall}`]: texture_asset.mana_small.texture,
    // Spawns
    [`${PropType.Ladder}`]: texture_asset.ladder.texture,
  };
};

export const monstersTextures = texture_asset => {
  return {
    [`${MonsterType.Bandit}`]: texture_asset.bandit.texture,
    [`${MonsterType.CentaurFemale}`]: texture_asset.centaur_female.texture,
    [`${MonsterType.CentaurMale}`]: texture_asset.centaur_male.texture,
    [`${MonsterType.MushroomLarge}`]: texture_asset.mushroom_large.texture,
    [`${MonsterType.MushroomSmall}`]: texture_asset.mushroom_small.texture,
    [`${MonsterType.Skeleton}`]: texture_asset.skeleton.texture,
    [`${MonsterType.Troll}`]: texture_asset.troll.texture,
    [`${MonsterType.Wolf}`]: texture_asset.wolf.texture,
  };
};
