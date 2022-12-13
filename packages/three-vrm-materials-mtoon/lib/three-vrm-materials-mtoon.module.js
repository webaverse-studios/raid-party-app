/*!
 * @pixiv/three-vrm-materials-mtoon v1.0.0
 * MToon (toon material) module for @pixiv/three-vrm
 *
 * Copyright (c) 2020-2021 pixiv Inc.
 * @pixiv/three-vrm-materials-mtoon is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 */
import * as THREE from 'three';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var vertexShader = "// #define PHONG\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n  varying vec3 vNormal;\n#endif\n\n#include <common>\n\n// #include <uv_pars_vertex>\n#ifdef MTOON_USE_UV\n  varying vec2 vUv;\n  uniform mat3 uvTransform;\n#endif\n\n#include <uv2_pars_vertex>\n// #include <displacementmap_pars_vertex>\n// #include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\n#ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE\n  uniform sampler2D outlineWidthMultiplyTexture;\n  uniform mat3 outlineWidthMultiplyTextureUvTransform;\n#endif\n\nuniform float outlineWidthFactor;\n\nvoid main() {\n\n  // #include <uv_vertex>\n  #ifdef MTOON_USE_UV\n    vUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n  #endif\n\n  #include <uv2_vertex>\n  #include <color_vertex>\n\n  #include <beginnormal_vertex>\n  #include <morphnormal_vertex>\n  #include <skinbase_vertex>\n  #include <skinnormal_vertex>\n\n  // we need this to compute the outline properly\n  objectNormal = normalize( objectNormal );\n\n  #include <defaultnormal_vertex>\n\n  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED\n    vNormal = normalize( transformedNormal );\n  #endif\n\n  #include <begin_vertex>\n\n  #include <morphtarget_vertex>\n  #include <skinning_vertex>\n  // #include <displacementmap_vertex>\n  #include <project_vertex>\n  #include <logdepthbuf_vertex>\n  #include <clipping_planes_vertex>\n\n  vViewPosition = - mvPosition.xyz;\n\n  float outlineTex = 1.0;\n\n  #ifdef OUTLINE\n    #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE\n      vec2 outlineWidthMultiplyTextureUv = ( outlineWidthMultiplyTextureUvTransform * vec3( vUv, 1 ) ).xy;\n      outlineTex = texture2D( outlineWidthMultiplyTexture, outlineWidthMultiplyTextureUv ).g;\n    #endif\n\n    #ifdef OUTLINE_WIDTH_WORLD\n      float worldNormalLength = length( transformedNormal );\n      vec3 outlineOffset = outlineWidthFactor * outlineTex * worldNormalLength * objectNormal;\n      gl_Position = projectionMatrix * modelViewMatrix * vec4( outlineOffset + transformed, 1.0 );\n    #endif\n\n    #ifdef OUTLINE_WIDTH_SCREEN\n      vec3 clipNormal = ( projectionMatrix * modelViewMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n      vec2 projectedNormal = normalize( clipNormal.xy );\n      projectedNormal.x *= projectionMatrix[ 0 ].x / projectionMatrix[ 1 ].y;\n      gl_Position.xy += 2.0 * outlineWidthFactor * outlineTex * projectedNormal.xy;\n    #endif\n\n    gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic\n  #endif\n\n  #include <worldpos_vertex>\n  // #include <envmap_vertex>\n  #include <shadowmap_vertex>\n  #include <fog_vertex>\n\n}";

var fragmentShader = "// #define PHONG\n\nuniform vec3 litFactor;\n\nuniform float opacity;\n\nuniform vec3 shadeColorFactor;\n#ifdef USE_SHADEMULTIPLYTEXTURE\n  uniform sampler2D shadeMultiplyTexture;\n  uniform mat3 shadeMultiplyTextureUvTransform;\n#endif\n\nuniform float shadingShiftFactor;\nuniform float shadingToonyFactor;\n\n#ifdef USE_SHADINGSHIFTTEXTURE\n  uniform sampler2D shadingShiftTexture;\n  uniform mat3 shadingShiftTextureUvTransform;\n  uniform float shadingShiftTextureScale;\n#endif\n\nuniform float giEqualizationFactor;\n\nuniform vec3 parametricRimColorFactor;\n#ifdef USE_RIMMULTIPLYTEXTURE\n  uniform sampler2D rimMultiplyTexture;\n  uniform mat3 rimMultiplyTextureUvTransform;\n#endif\nuniform float rimLightingMixFactor;\nuniform float parametricRimFresnelPowerFactor;\nuniform float parametricRimLiftFactor;\n\n#ifdef USE_MATCAPTEXTURE\n  uniform vec3 matcapFactor;\n  uniform sampler2D matcapTexture;\n  uniform mat3 matcapTextureUvTransform;\n#endif\n\nuniform vec3 emissive;\nuniform float emissiveIntensity;\n\nuniform vec3 outlineColorFactor;\nuniform float outlineLightingMixFactor;\n\n#ifdef USE_UVANIMATIONMASKTEXTURE\n  uniform sampler2D uvAnimationMaskTexture;\n  uniform mat3 uvAnimationMaskTextureUvTransform;\n#endif\n\nuniform float uvAnimationScrollXOffset;\nuniform float uvAnimationScrollYOffset;\nuniform float uvAnimationRotationPhase;\n\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n\n// #include <uv_pars_fragment>\n#if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n  varying vec2 vUv;\n#endif\n\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n\n#ifdef USE_MAP\n  uniform mat3 mapUvTransform;\n#endif\n\n// #include <alphamap_pars_fragment>\n\n#if THREE_VRM_THREE_REVISION >= 132\n  #include <alphatest_pars_fragment>\n#endif\n\n#include <aomap_pars_fragment>\n// #include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n\n#ifdef USE_EMISSIVEMAP\n  uniform mat3 emissiveMapUvTransform;\n#endif\n\n// #include <envmap_common_pars_fragment>\n// #include <envmap_pars_fragment>\n// #include <cube_uv_reflection_fragment>\n#include <fog_pars_fragment>\n\n// #include <bsdfs>\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n  return RECIPROCAL_PI * diffuseColor;\n}\n\n#include <lights_pars_begin>\n\n#if THREE_VRM_THREE_REVISION >= 132\n  #include <normal_pars_fragment>\n#endif\n\n// #include <lights_phong_pars_fragment>\nvarying vec3 vViewPosition;\n\n#if THREE_VRM_THREE_REVISION < 132\n  #ifndef FLAT_SHADED\n    varying vec3 vNormal;\n  #endif\n#endif\n\nstruct MToonMaterial {\n  vec3 diffuseColor;\n  vec3 shadeColor;\n  float shadingShift;\n};\n\nfloat linearstep( float a, float b, float t ) {\n  return clamp( ( t - a ) / ( b - a ), 0.0, 1.0 );\n}\n\n/**\n * Convert NdotL into toon shading factor using shadingShift and shadingToony\n */\nfloat getShading(\n  const in float dotNL,\n  const in float shadow,\n  const in float shadingShift\n) {\n  float shading = dotNL;\n  shading = shading + shadingShift;\n  shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading );\n  shading *= shadow;\n  return shading;\n}\n\n/**\n * Mix diffuseColor and shadeColor using shading factor and light color\n */\nvec3 getDiffuse(\n  const in MToonMaterial material,\n  const in float shading,\n  in vec3 lightColor\n) {\n  #ifdef DEBUG_LITSHADERATE\n    return vec3( BRDF_Lambert( shading * lightColor ) );\n  #endif\n\n  #if THREE_VRM_THREE_REVISION < 132\n    #ifndef PHYSICALLY_CORRECT_LIGHTS\n      lightColor *= PI;\n    #endif\n  #endif\n\n  vec3 col = lightColor * BRDF_Lambert( mix( material.shadeColor, material.diffuseColor, shading ) );\n\n  // The \"comment out if you want to PBR absolutely\" line\n  #ifdef V0_COMPAT_SHADE\n    col = min( col, material.diffuseColor );\n  #endif\n\n  return col;\n}\n\nvoid RE_Direct_MToon( const in IncidentLight directLight, const in GeometricContext geometry, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {\n  float dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n  vec3 irradiance = directLight.color;\n\n  #if THREE_VRM_THREE_REVISION < 132\n    #ifndef PHYSICALLY_CORRECT_LIGHTS\n      irradiance *= PI;\n    #endif\n  #endif\n\n  // directSpecular will be used for rim lighting, not an actual specular\n  reflectedLight.directSpecular += irradiance;\n\n  irradiance *= dotNL;\n\n  float shading = getShading( dotNL, shadow, material.shadingShift );\n\n  // toon shaded diffuse\n  reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );\n}\n\nvoid RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in GeometricContext geometry, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {\n  // indirect diffuse will use diffuseColor, no shadeColor involved\n  reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n\n  // directSpecular will be used for rim lighting, not an actual specular\n  reflectedLight.directSpecular += irradiance;\n}\n\n#define RE_Direct RE_Direct_MToon\n#define RE_IndirectDiffuse RE_IndirectDiffuse_MToon\n#define Material_LightProbeLOD( material ) (0)\n\n#include <shadowmap_pars_fragment>\n// #include <bumpmap_pars_fragment>\n\n// #include <normalmap_pars_fragment>\n#ifdef USE_NORMALMAP\n\n  uniform sampler2D normalMap;\n  uniform mat3 normalMapUvTransform;\n  uniform vec2 normalScale;\n\n#endif\n\n#ifdef OBJECTSPACE_NORMALMAP\n\n  uniform mat3 normalMatrix;\n\n#endif\n\n#if ! defined ( USE_TANGENT ) && defined ( TANGENTSPACE_NORMALMAP )\n\n  // Per-Pixel Tangent Space Normal Mapping\n  // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html\n\n  // three-vrm specific change: it requires `uv` as an input in order to support uv scrolls\n\n  // Temporary compat against shader change @ Three.js r126\n  // See: #21205, #21307, #21299\n  #if THREE_VRM_THREE_REVISION >= 126\n\n    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {\n\n      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n      vec2 st0 = dFdx( uv.st );\n      vec2 st1 = dFdy( uv.st );\n\n      vec3 N = normalize( surf_norm );\n\n      vec3 q1perp = cross( q1, N );\n      vec3 q0perp = cross( N, q0 );\n\n      vec3 T = q1perp * st0.x + q0perp * st1.x;\n      vec3 B = q1perp * st0.y + q0perp * st1.y;\n\n      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0\n      // TODO: Is this still required? Or shall I make a PR about it?\n      if ( length( T ) == 0.0 || length( B ) == 0.0 ) {\n        return surf_norm;\n      }\n\n      float det = max( dot( T, T ), dot( B, B ) );\n      float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );\n\n      return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );\n\n    }\n\n  #else\n\n    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN ) {\n\n      // Workaround for Adreno 3XX dFd*( vec3 ) bug. See #9988\n\n      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );\n      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );\n      vec2 st0 = dFdx( uv.st );\n      vec2 st1 = dFdy( uv.st );\n\n      float scale = sign( st1.t * st0.s - st0.t * st1.s ); // we do not care about the magnitude\n\n      vec3 S = ( q0 * st1.t - q1 * st0.t ) * scale;\n      vec3 T = ( - q0 * st1.s + q1 * st0.s ) * scale;\n\n      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0\n      // TODO: Is this still required? Or shall I make a PR about it?\n\n      if ( length( S ) == 0.0 || length( T ) == 0.0 ) {\n        return surf_norm;\n      }\n\n      S = normalize( S );\n      T = normalize( T );\n      vec3 N = normalize( surf_norm );\n\n      #ifdef DOUBLE_SIDED\n\n        // Workaround for Adreno GPUs gl_FrontFacing bug. See #15850 and #10331\n\n        bool frontFacing = dot( cross( S, T ), N ) > 0.0;\n\n        mapN.xy *= ( float( frontFacing ) * 2.0 - 1.0 );\n\n      #else\n\n        mapN.xy *= ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n      #endif\n\n      mat3 tsn = mat3( S, T, N );\n      return normalize( tsn * mapN );\n\n    }\n\n  #endif\n\n#endif\n\n// #include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\n// == post correction ==========================================================\nvoid postCorrection() {\n  #include <tonemapping_fragment>\n  #include <encodings_fragment>\n  #include <fog_fragment>\n  #include <premultiplied_alpha_fragment>\n  #include <dithering_fragment>\n}\n\n// == main procedure ===========================================================\nvoid main() {\n  #include <clipping_planes_fragment>\n\n  vec2 uv = vec2(0.5, 0.5);\n\n  #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n    uv = vUv;\n\n    float uvAnimMask = 1.0;\n    #ifdef USE_UVANIMATIONMASKTEXTURE\n      vec2 uvAnimationMaskTextureUv = ( uvAnimationMaskTextureUvTransform * vec3( uv, 1 ) ).xy;\n      uvAnimMask = texture2D( uvAnimationMaskTexture, uvAnimationMaskTextureUv ).b;\n    #endif\n\n    uv = uv + vec2( uvAnimationScrollXOffset, uvAnimationScrollYOffset ) * uvAnimMask;\n    float uvRotCos = cos( uvAnimationRotationPhase * uvAnimMask );\n    float uvRotSin = sin( uvAnimationRotationPhase * uvAnimMask );\n    uv = mat2( uvRotCos, uvRotSin, -uvRotSin, uvRotCos ) * ( uv - 0.5 ) + 0.5;\n  #endif\n\n  #ifdef DEBUG_UV\n    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n    #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )\n      gl_FragColor = vec4( uv, 0.0, 1.0 );\n    #endif\n    return;\n  #endif\n\n  vec4 diffuseColor = vec4( litFactor, opacity );\n  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n  vec3 totalEmissiveRadiance = emissive * emissiveIntensity;\n\n  #include <logdepthbuf_fragment>\n\n  // #include <map_fragment>\n  #ifdef USE_MAP\n    vec2 mapUv = ( mapUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      vec4 sampledDiffuseColor = texture2D( map, mapUv );\n      #ifdef DECODE_VIDEO_TEXTURE\n        sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );\n      #endif\n      diffuseColor *= sampledDiffuseColor;\n    #else\n      // COMPAT: pre-r137\n      vec4 texelColor = texture2D( map, mapUv );\n      texelColor = mapTexelToLinear( texelColor );\n      diffuseColor *= texelColor;\n    #endif\n  #endif\n\n  // #include <color_fragment>\n  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )\n    diffuseColor.rgb *= vColor;\n  #endif\n\n  // #include <alphamap_fragment>\n\n  #include <alphatest_fragment>\n\n  // #include <specularmap_fragment>\n  #include <normal_fragment_begin>\n\n  #ifdef OUTLINE\n    normal *= -1.0;\n  #endif\n\n  // #include <normal_fragment_maps>\n\n  #ifdef OBJECTSPACE_NORMALMAP\n\n    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;\n    normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals\n\n    #ifdef FLIP_SIDED\n\n      normal = - normal;\n\n    #endif\n\n    #ifdef DOUBLE_SIDED\n\n      // Temporary compat against shader change @ Three.js r126\n      // See: #21205, #21307, #21299\n      #if THREE_VRM_THREE_REVISION >= 126\n\n        normal = normal * faceDirection;\n\n      #else\n\n        normal = normal * ( float( gl_FrontFacing ) * 2.0 - 1.0 );\n\n      #endif\n\n    #endif\n\n    normal = normalize( normalMatrix * normal );\n\n  #elif defined( TANGENTSPACE_NORMALMAP )\n\n    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;\n    vec3 mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0;\n    mapN.xy *= normalScale;\n\n    #ifdef USE_TANGENT\n\n      normal = normalize( vTBN * mapN );\n\n    #else\n\n      // Temporary compat against shader change @ Three.js r126\n      // See: #21205, #21307, #21299\n      #if THREE_VRM_THREE_REVISION >= 126\n\n        normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN, faceDirection );\n\n      #else\n\n        normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN );\n\n      #endif\n\n    #endif\n\n  #endif\n\n  // #include <emissivemap_fragment>\n  #ifdef USE_EMISSIVEMAP\n    vec2 emissiveMapUv = ( emissiveMapUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      totalEmissiveRadiance *= texture2D( emissiveMap, emissiveMapUv ).rgb;\n    #else\n      // COMPAT: pre-r137\n      totalEmissiveRadiance *= emissiveMapTexelToLinear( texture2D( emissiveMap, emissiveMapUv ) ).rgb;\n    #endif\n  #endif\n\n  #ifdef DEBUG_NORMAL\n    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );\n    return;\n  #endif\n\n  // -- MToon: lighting --------------------------------------------------------\n  // accumulation\n  // #include <lights_phong_fragment>\n  MToonMaterial material;\n\n  material.diffuseColor = diffuseColor.rgb;\n\n  material.shadeColor = shadeColorFactor;\n  #ifdef USE_SHADEMULTIPLYTEXTURE\n    vec2 shadeMultiplyTextureUv = ( shadeMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      material.shadeColor *= texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv ).rgb;\n    #else\n      // COMPAT: pre-r137\n      material.shadeColor *= shadeMultiplyTextureTexelToLinear( texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv) ).rgb;\n    #endif\n  #endif\n\n  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )\n    material.shadeColor.rgb *= vColor;\n  #endif\n\n  material.shadingShift = shadingShiftFactor;\n  #ifdef USE_SHADINGSHIFTTEXTURE\n    vec2 shadingShiftTextureUv = ( shadingShiftTextureUvTransform * vec3( uv, 1 ) ).xy;\n    material.shadingShift += texture2D( shadingShiftTexture, shadingShiftTextureUv ).r * shadingShiftTextureScale;\n  #endif\n\n  // #include <lights_fragment_begin>\n\n  // MToon Specific changes:\n  // Since we want to take shadows into account of shading instead of irradiance,\n  // we had to modify the codes that multiplies the results of shadowmap into color of direct lights.\n\n  GeometricContext geometry;\n\n  geometry.position = - vViewPosition;\n  geometry.normal = normal;\n  geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n\n  #ifdef CLEARCOAT\n\n    geometry.clearcoatNormal = clearcoatNormal;\n\n  #endif\n\n  IncidentLight directLight;\n\n  // since these variables will be used in unrolled loop, we have to define in prior\n  float shadow;\n\n  #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\n    PointLight pointLight;\n    #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n    PointLightShadow pointLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\n      pointLight = pointLights[ i ];\n\n      #if THREE_VRM_THREE_REVISION >= 132\n        getPointLightInfo( pointLight, geometry, directLight );\n      #else\n        getPointDirectLightIrradiance( pointLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n      pointLightShadow = pointLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n      #endif\n\n      RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  #if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\n    SpotLight spotLight;\n    #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n    SpotLightShadow spotLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\n      spotLight = spotLights[ i ];\n\n      #if THREE_VRM_THREE_REVISION >= 132\n        getSpotLightInfo( spotLight, geometry, directLight );\n      #else\n        getSpotDirectLightIrradiance( spotLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n      spotLightShadow = spotLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;\n      #endif\n\n      RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  #if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\n    DirectionalLight directionalLight;\n    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n    DirectionalLightShadow directionalLightShadow;\n    #endif\n\n    #pragma unroll_loop_start\n    for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\n      directionalLight = directionalLights[ i ];\n\n      #if THREE_VRM_THREE_REVISION >= 132\n        getDirectionalLightInfo( directionalLight, geometry, directLight );\n      #else\n        getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );\n      #endif\n\n      shadow = 1.0;\n      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n      directionalLightShadow = directionalLightShadows[ i ];\n      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n      #endif\n\n      RE_Direct( directLight, geometry, material, shadow, reflectedLight );\n\n    }\n    #pragma unroll_loop_end\n\n  #endif\n\n  // #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\n  //   RectAreaLight rectAreaLight;\n\n  //   #pragma unroll_loop_start\n  //   for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\n  //     rectAreaLight = rectAreaLights[ i ];\n  //     RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\n  //   }\n  //   #pragma unroll_loop_end\n\n  // #endif\n\n  #if defined( RE_IndirectDiffuse )\n\n    vec3 iblIrradiance = vec3( 0.0 );\n\n    vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\n    #if THREE_VRM_THREE_REVISION >= 133\n      irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );\n    #else\n      irradiance += getLightProbeIrradiance( lightProbe, geometry );\n    #endif\n\n    #if ( NUM_HEMI_LIGHTS > 0 )\n\n      #pragma unroll_loop_start\n      for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\n        #if THREE_VRM_THREE_REVISION >= 133\n          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );\n        #else\n          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );\n        #endif\n\n      }\n      #pragma unroll_loop_end\n\n    #endif\n\n  #endif\n\n  // #if defined( RE_IndirectSpecular )\n\n  //   vec3 radiance = vec3( 0.0 );\n  //   vec3 clearcoatRadiance = vec3( 0.0 );\n\n  // #endif\n\n  #include <lights_fragment_maps>\n  #include <lights_fragment_end>\n\n  // modulation\n  #include <aomap_fragment>\n\n  vec3 col = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n\n  #ifdef DEBUG_LITSHADERATE\n    gl_FragColor = vec4( col, diffuseColor.a );\n    postCorrection();\n    return;\n  #endif\n\n  // -- MToon: rim lighting -----------------------------------------\n  vec3 viewDir = normalize( vViewPosition );\n\n  #ifndef PHYSICALLY_CORRECT_LIGHTS\n    reflectedLight.directSpecular /= PI;\n  #endif\n  vec3 rimMix = mix( vec3( 1.0 ), reflectedLight.directSpecular, 1.0 );\n\n  vec3 rim = parametricRimColorFactor * pow( saturate( 1.0 - dot( viewDir, normal ) + parametricRimLiftFactor ), parametricRimFresnelPowerFactor );\n\n  #ifdef USE_MATCAPTEXTURE\n    {\n      vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );\n      vec3 y = cross( viewDir, x ); // guaranteed to be normalized\n      vec2 sphereUv = 0.5 + 0.5 * vec2( dot( x, normal ), -dot( y, normal ) );\n      sphereUv = ( matcapTextureUvTransform * vec3( sphereUv, 1 ) ).xy;\n      #if THREE_VRM_THREE_REVISION >= 137\n        vec3 matcap = texture2D( matcapTexture, sphereUv ).rgb;\n      #else\n        // COMPAT: pre-r137\n        vec3 matcap = matcapTextureTexelToLinear( texture2D( matcapTexture, sphereUv ) ).rgb;\n      #endif\n      rim += matcapFactor * matcap;\n    }\n  #endif\n\n  #ifdef USE_RIMMULTIPLYTEXTURE\n    vec2 rimMultiplyTextureUv = ( rimMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;\n    #if THREE_VRM_THREE_REVISION >= 137\n      rim *= texture2D( rimMultiplyTexture, rimMultiplyTextureUv ).rgb;\n    #else\n      // COMPAT: pre-r137\n      rim *= rimMultiplyTextureTexelToLinear( texture2D( rimMultiplyTexture, rimMultiplyTextureUv ) ).rgb;\n    #endif\n  #endif\n\n  col += rimMix * rim;\n\n  // -- MToon: Emission --------------------------------------------------------\n  col += totalEmissiveRadiance;\n\n  // #include <envmap_fragment>\n\n  // -- Almost done! -----------------------------------------------------------\n  #if defined( OUTLINE )\n    col = outlineColorFactor.rgb * mix( vec3( 1.0 ), col, outlineLightingMixFactor );\n  #endif\n\n  gl_FragColor = vec4( col, diffuseColor.a );\n  postCorrection();\n}\n";

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Specifiers of debug mode of {@link MToonMaterial}.
 *
 * See: {@link MToonMaterial.debugMode}
 */
const MToonMaterialDebugMode = {
    /**
     * Render normally.
     */
    None: 'none',
    /**
     * Visualize normals of the surface.
     */
    Normal: 'normal',
    /**
     * Visualize lit/shade of the surface.
     */
    LitShadeRate: 'litShadeRate',
    /**
     * Visualize UV of the surface.
     */
    UV: 'uv',
};

/* eslint-disable @typescript-eslint/naming-convention */
const MToonMaterialOutlineWidthMode = {
    None: 'none',
    WorldCoordinates: 'worldCoordinates',
    ScreenCoordinates: 'screenCoordinates',
};

// Since these constants are deleted in r136 we have to define by ourselves
/* eslint-disable @typescript-eslint/naming-convention */
const RGBEEncoding = 3002;
const RGBM7Encoding = 3004;
const RGBM16Encoding = 3005;
const RGBDEncoding = 3006;
const GammaEncoding = 3007;
/* eslint-enable @typescript-eslint/naming-convention */
/**
 * COMPAT: pre-r137
 *
 * Ref: https://github.com/mrdoob/three.js/blob/r136/src/renderers/webgl/WebGLProgram.js#L22
 */
const getEncodingComponents = (encoding) => {
    if (parseInt(THREE.REVISION, 10) >= 136) {
        switch (encoding) {
            case THREE.LinearEncoding:
                return ['Linear', '( value )'];
            case THREE.sRGBEncoding:
                return ['sRGB', '( value )'];
            default:
                console.warn('THREE.WebGLProgram: Unsupported encoding:', encoding);
                return ['Linear', '( value )'];
        }
    }
    else {
        // COMPAT: pre-r136
        switch (encoding) {
            case THREE.LinearEncoding:
                return ['Linear', '( value )'];
            case THREE.sRGBEncoding:
                return ['sRGB', '( value )'];
            case RGBEEncoding:
                return ['RGBE', '( value )'];
            case RGBM7Encoding:
                return ['RGBM', '( value, 7.0 )'];
            case RGBM16Encoding:
                return ['RGBM', '( value, 16.0 )'];
            case RGBDEncoding:
                return ['RGBD', '( value, 256.0 )'];
            case GammaEncoding:
                return ['Gamma', '( value, float( GAMMA_FACTOR ) )'];
            default:
                throw new Error('unsupported encoding: ' + encoding);
        }
    }
};
/**
 * COMPAT: pre-r137
 *
 * This function is no longer required beginning from r137
 *
 * https://github.com/mrdoob/three.js/blob/r136/src/renderers/webgl/WebGLProgram.js#L52
 */
const getTexelDecodingFunction = (functionName, encoding) => {
    const components = getEncodingComponents(encoding);
    return 'vec4 ' + functionName + '( vec4 value ) { return ' + components[0] + 'ToLinear' + components[1] + '; }';
};

/**
 * COMPAT: pre-r137
 *
 * This function is no longer required beginning from r137
 *
 * Retrieved from https://github.com/mrdoob/three.js/blob/88b6328998d155fa0a7c1f1e5e3bd6bff75268c0/src/renderers/webgl/WebGLPrograms.js#L92
 *
 * Diff:
 *   - Remove WebGLRenderTarget handler because it increases code complexities on TypeScript
 *   - Add a boolean `isWebGL2` as a second argument.
 */
function getTextureEncodingFromMap(map, isWebGL2) {
    let encoding;
    if (map && map.isTexture) {
        encoding = map.encoding;
        // } else if ( map && map.isWebGLRenderTarget ) {
        //   console.warn( 'THREE.WebGLPrograms.getTextureEncodingFromMap: don\'t use render targets as textures. Use their .texture property instead.' );
        //   encoding = map.texture.encoding;
    }
    else {
        encoding = THREE.LinearEncoding;
    }
    if (parseInt(THREE.REVISION, 10) >= 133) {
        if (isWebGL2 &&
            map &&
            map.isTexture &&
            map.format === THREE.RGBAFormat &&
            map.type === THREE.UnsignedByteType &&
            map.encoding === THREE.sRGBEncoding) {
            encoding = THREE.LinearEncoding; // disable inline decode for sRGB textures in WebGL 2
        }
    }
    return encoding;
}

/* tslint:disable:member-ordering */
/**
 * MToon is a material specification that has various features.
 * The spec and implementation are originally founded for Unity engine and this is a port of the material.
 *
 * See: https://github.com/Santarh/MToon
 */
class MToonMaterial extends THREE.ShaderMaterial {
    constructor(parameters = {}) {
        super({ vertexShader, fragmentShader });
        this.uvAnimationScrollXSpeedFactor = 0.0;
        this.uvAnimationScrollYSpeedFactor = 0.0;
        this.uvAnimationRotationSpeedFactor = 0.0;
        /**
         * Whether the material is affected by fog.
         * `true` by default.
         */
        this.fog = true;
        /**
         * Will be read in WebGLPrograms
         *
         * See: https://github.com/mrdoob/three.js/blob/4f5236ac3d6f41d904aa58401b40554e8fbdcb15/src/renderers/webgl/WebGLPrograms.js#L190-L191
         */
        this.normalMapType = THREE.TangentSpaceNormalMap;
        /**
         * When this is `true`, vertex colors will be ignored.
         * `true` by default.
         */
        this._ignoreVertexColor = true;
        this._v0CompatShade = false;
        this._debugMode = MToonMaterialDebugMode.None;
        this._outlineWidthMode = MToonMaterialOutlineWidthMode.None;
        this._isOutline = false;
        // override depthWrite with transparentWithZWrite
        if (parameters.transparentWithZWrite) {
            parameters.depthWrite = true;
        }
        delete parameters.transparentWithZWrite;
        // == enabling bunch of stuff ==================================================================
        parameters.fog = true;
        parameters.lights = true;
        parameters.clipping = true;
        // COMPAT: pre-r129
        // See: https://github.com/mrdoob/three.js/pull/21788
        if (parseInt(THREE.REVISION, 10) < 129) {
            parameters.skinning = parameters.skinning || false;
        }
        // COMPAT: pre-r131
        // See: https://github.com/mrdoob/three.js/pull/22169
        if (parseInt(THREE.REVISION, 10) < 131) {
            parameters.morphTargets = parameters.morphTargets || false;
            parameters.morphNormals = parameters.morphNormals || false;
        }
        // == uniforms =================================================================================
        this.uniforms = THREE.UniformsUtils.merge([
            THREE.UniformsLib.common,
            THREE.UniformsLib.normalmap,
            THREE.UniformsLib.emissivemap,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.lights,
            {
                litFactor: { value: new THREE.Color(1.0, 1.0, 1.0) },
                mapUvTransform: { value: new THREE.Matrix3() },
                colorAlpha: { value: 1.0 },
                normalMapUvTransform: { value: new THREE.Matrix3() },
                shadeColorFactor: { value: new THREE.Color(0.97, 0.81, 0.86) },
                shadeMultiplyTexture: { value: null },
                shadeMultiplyTextureUvTransform: { value: new THREE.Matrix3() },
                shadingShiftFactor: { value: 0.0 },
                shadingShiftTexture: { value: null },
                shadingShiftTextureUvTransform: { value: new THREE.Matrix3() },
                shadingShiftTextureScale: { value: null },
                shadingToonyFactor: { value: 0.9 },
                giEqualizationFactor: { value: 0.9 },
                matcapFactor: { value: new THREE.Color(0.0, 0.0, 0.0) },
                matcapTexture: { value: null },
                matcapTextureUvTransform: { value: new THREE.Matrix3() },
                parametricRimColorFactor: { value: new THREE.Color(0.0, 0.0, 0.0) },
                rimMultiplyTexture: { value: null },
                rimMultiplyTextureUvTransform: { value: new THREE.Matrix3() },
                rimLightingMixFactor: { value: 0.0 },
                parametricRimFresnelPowerFactor: { value: 1.0 },
                parametricRimLiftFactor: { value: 0.0 },
                emissive: { value: new THREE.Color(0.0, 0.0, 0.0) },
                emissiveIntensity: { value: 1.0 },
                emissiveMapUvTransform: { value: new THREE.Matrix3() },
                outlineWidthMultiplyTexture: { value: null },
                outlineWidthMultiplyTextureUvTransform: { value: new THREE.Matrix3() },
                outlineWidthFactor: { value: 0.5 },
                outlineColorFactor: { value: new THREE.Color(0.0, 0.0, 0.0) },
                outlineLightingMixFactor: { value: 1.0 },
                uvAnimationMaskTexture: { value: null },
                uvAnimationMaskTextureUvTransform: { value: new THREE.Matrix3() },
                uvAnimationScrollXOffset: { value: 0.0 },
                uvAnimationScrollYOffset: { value: 0.0 },
                uvAnimationRotationPhase: { value: 0.0 },
            },
            parameters.uniforms,
        ]);
        // == finally compile the shader program =======================================================
        this.setValues(parameters);
        // == upload uniforms that need to upload ======================================================
        this._uploadUniformsWorkaround();
        // == update shader stuff ======================================================================
        this.customProgramCacheKey = () => [
            this._ignoreVertexColor ? 'ignoreVertexColor' : '',
            this._v0CompatShade ? 'v0CompatShade' : '',
            this._debugMode !== 'none' ? `debugMode:${this._debugMode}` : '',
            this._outlineWidthMode !== 'none' ? `outlineWidthMode:${this._outlineWidthMode}` : '',
            this._isOutline ? 'isOutline' : '',
            ...Object.entries(this._generateDefines()).map(([token, macro]) => `${token}:${macro}`),
            this.matcapTexture ? `matcapTextureEncoding:${this.matcapTexture.encoding}` : '',
            this.shadeMultiplyTexture ? `shadeMultiplyTextureEncoding:${this.shadeMultiplyTexture.encoding}` : '',
            this.rimMultiplyTexture ? `rimMultiplyTextureEncoding:${this.rimMultiplyTexture.encoding}` : '',
        ].join(',');
        this.onBeforeCompile = (shader, renderer) => {
            /**
             * Will be needed to determine whether we should inline convert sRGB textures or not.
             * See: https://github.com/mrdoob/three.js/pull/22551
             */
            const isWebGL2 = renderer.capabilities.isWebGL2;
            const threeRevision = parseInt(THREE.REVISION, 10);
            const defines = Object.entries(Object.assign(Object.assign({}, this._generateDefines()), this.defines))
                .filter(([token, macro]) => !!macro)
                .map(([token, macro]) => `#define ${token} ${macro}`)
                .join('\n') + '\n';
            // -- texture encodings ----------------------------------------------------------------------
            // COMPAT: pre-r137
            let encodings = '';
            if (parseInt(THREE.REVISION, 10) < 137) {
                encodings =
                    (this.matcapTexture !== null
                        ? getTexelDecodingFunction('matcapTextureTexelToLinear', getTextureEncodingFromMap(this.matcapTexture, isWebGL2)) + '\n'
                        : '') +
                        (this.shadeMultiplyTexture !== null
                            ? getTexelDecodingFunction('shadeMultiplyTextureTexelToLinear', getTextureEncodingFromMap(this.shadeMultiplyTexture, isWebGL2)) + '\n'
                            : '') +
                        (this.rimMultiplyTexture !== null
                            ? getTexelDecodingFunction('rimMultiplyTextureTexelToLinear', getTextureEncodingFromMap(this.rimMultiplyTexture, isWebGL2)) + '\n'
                            : '');
            }
            // -- generate shader code -------------------------------------------------------------------
            shader.vertexShader = defines + shader.vertexShader;
            shader.fragmentShader = defines + encodings + shader.fragmentShader;
            // -- compat ---------------------------------------------------------------------------------
            // COMPAT: pre-r132
            // Three.js r132 introduces new shader chunks <normal_pars_fragment> and <alphatest_pars_fragment>
            if (threeRevision < 132) {
                shader.fragmentShader = shader.fragmentShader.replace('#include <normal_pars_fragment>', '');
                shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_pars_fragment>', '');
            }
        };
    }
    get color() {
        return this.uniforms.litFactor.value;
    }
    set color(value) {
        this.uniforms.litFactor.value = value;
    }
    get map() {
        return this.uniforms.map.value;
    }
    set map(value) {
        this.uniforms.map.value = value;
    }
    get normalMap() {
        return this.uniforms.normalMap.value;
    }
    set normalMap(value) {
        this.uniforms.normalMap.value = value;
    }
    get normalScale() {
        return this.uniforms.normalScale.value;
    }
    set normalScale(value) {
        this.uniforms.normalScale.value = value;
    }
    get emissive() {
        return this.uniforms.emissive.value;
    }
    set emissive(value) {
        this.uniforms.emissive.value = value;
    }
    get emissiveIntensity() {
        return this.uniforms.emissiveIntensity.value;
    }
    set emissiveIntensity(value) {
        this.uniforms.emissiveIntensity.value = value;
    }
    get emissiveMap() {
        return this.uniforms.emissiveMap.value;
    }
    set emissiveMap(value) {
        this.uniforms.emissiveMap.value = value;
    }
    get shadeColorFactor() {
        return this.uniforms.shadeColorFactor.value;
    }
    set shadeColorFactor(value) {
        this.uniforms.shadeColorFactor.value = value;
    }
    get shadeMultiplyTexture() {
        return this.uniforms.shadeMultiplyTexture.value;
    }
    set shadeMultiplyTexture(value) {
        this.uniforms.shadeMultiplyTexture.value = value;
    }
    get shadingShiftFactor() {
        return this.uniforms.shadingShiftFactor.value;
    }
    set shadingShiftFactor(value) {
        this.uniforms.shadingShiftFactor.value = value;
    }
    get shadingShiftTexture() {
        return this.uniforms.shadingShiftTexture.value;
    }
    set shadingShiftTexture(value) {
        this.uniforms.shadingShiftTexture.value = value;
    }
    get shadingShiftTextureScale() {
        return this.uniforms.shadingShiftTextureScale.value;
    }
    set shadingShiftTextureScale(value) {
        this.uniforms.shadingShiftTextureScale.value = value;
    }
    get shadingToonyFactor() {
        return this.uniforms.shadingToonyFactor.value;
    }
    set shadingToonyFactor(value) {
        this.uniforms.shadingToonyFactor.value = value;
    }
    get giEqualizationFactor() {
        return this.uniforms.giEqualizationFactor.value;
    }
    set giEqualizationFactor(value) {
        this.uniforms.giEqualizationFactor.value = value;
    }
    get matcapFactor() {
        return this.uniforms.matcapFactor.value;
    }
    set matcapFactor(value) {
        this.uniforms.matcapFactor.value = value;
    }
    get matcapTexture() {
        return this.uniforms.matcapTexture.value;
    }
    set matcapTexture(value) {
        this.uniforms.matcapTexture.value = value;
    }
    get parametricRimColorFactor() {
        return this.uniforms.parametricRimColorFactor.value;
    }
    set parametricRimColorFactor(value) {
        this.uniforms.parametricRimColorFactor.value = value;
    }
    get rimMultiplyTexture() {
        return this.uniforms.rimMultiplyTexture.value;
    }
    set rimMultiplyTexture(value) {
        this.uniforms.rimMultiplyTexture.value = value;
    }
    get rimLightingMixFactor() {
        return this.uniforms.rimLightingMixFactor.value;
    }
    set rimLightingMixFactor(value) {
        this.uniforms.rimLightingMixFactor.value = value;
    }
    get parametricRimFresnelPowerFactor() {
        return this.uniforms.parametricRimFresnelPowerFactor.value;
    }
    set parametricRimFresnelPowerFactor(value) {
        this.uniforms.parametricRimFresnelPowerFactor.value = value;
    }
    get parametricRimLiftFactor() {
        return this.uniforms.parametricRimLiftFactor.value;
    }
    set parametricRimLiftFactor(value) {
        this.uniforms.parametricRimLiftFactor.value = value;
    }
    get outlineWidthMultiplyTexture() {
        return this.uniforms.outlineWidthMultiplyTexture.value;
    }
    set outlineWidthMultiplyTexture(value) {
        this.uniforms.outlineWidthMultiplyTexture.value = value;
    }
    get outlineWidthFactor() {
        return this.uniforms.outlineWidthFactor.value;
    }
    set outlineWidthFactor(value) {
        this.uniforms.outlineWidthFactor.value = value;
    }
    get outlineColorFactor() {
        return this.uniforms.outlineColorFactor.value;
    }
    set outlineColorFactor(value) {
        this.uniforms.outlineColorFactor.value = value;
    }
    get outlineLightingMixFactor() {
        return this.uniforms.outlineLightingMixFactor.value;
    }
    set outlineLightingMixFactor(value) {
        this.uniforms.outlineLightingMixFactor.value = value;
    }
    get uvAnimationMaskTexture() {
        return this.uniforms.uvAnimationMaskTexture.value;
    }
    set uvAnimationMaskTexture(value) {
        this.uniforms.uvAnimationMaskTexture.value = value;
    }
    get uvAnimationScrollXOffset() {
        return this.uniforms.uvAnimationScrollXOffset.value;
    }
    set uvAnimationScrollXOffset(value) {
        this.uniforms.uvAnimationScrollXOffset.value = value;
    }
    get uvAnimationScrollYOffset() {
        return this.uniforms.uvAnimationScrollYOffset.value;
    }
    set uvAnimationScrollYOffset(value) {
        this.uniforms.uvAnimationScrollYOffset.value = value;
    }
    get uvAnimationRotationPhase() {
        return this.uniforms.uvAnimationRotationPhase.value;
    }
    set uvAnimationRotationPhase(value) {
        this.uniforms.uvAnimationRotationPhase.value = value;
    }
    /**
     * When this is `true`, vertex colors will be ignored.
     * `true` by default.
     */
    get ignoreVertexColor() {
        return this._ignoreVertexColor;
    }
    set ignoreVertexColor(value) {
        this._ignoreVertexColor = value;
        this.needsUpdate = true;
    }
    /**
     * There is a line of the shader called "comment out if you want to PBR absolutely" in VRM0.0 MToon.
     * When this is true, the material enables the line to make it compatible with the legacy rendering of VRM.
     * Usually not recommended to turn this on.
     * `false` by default.
     */
    get v0CompatShade() {
        return this._v0CompatShade;
    }
    /**
     * There is a line of the shader called "comment out if you want to PBR absolutely" in VRM0.0 MToon.
     * When this is true, the material enables the line to make it compatible with the legacy rendering of VRM.
     * Usually not recommended to turn this on.
     * `false` by default.
     */
    set v0CompatShade(v) {
        this._v0CompatShade = v;
        this.needsUpdate = true;
    }
    /**
     * Debug mode for the material.
     * You can visualize several components for diagnosis using debug mode.
     *
     * See: {@link MToonMaterialDebugMode}
     */
    get debugMode() {
        return this._debugMode;
    }
    /**
     * Debug mode for the material.
     * You can visualize several components for diagnosis using debug mode.
     *
     * See: {@link MToonMaterialDebugMode}
     */
    set debugMode(m) {
        this._debugMode = m;
        this.needsUpdate = true;
    }
    get outlineWidthMode() {
        return this._outlineWidthMode;
    }
    set outlineWidthMode(m) {
        this._outlineWidthMode = m;
        this.needsUpdate = true;
    }
    get isOutline() {
        return this._isOutline;
    }
    set isOutline(b) {
        this._isOutline = b;
        this.needsUpdate = true;
    }
    /**
     * Readonly boolean that indicates this is a [[MToonMaterial]].
     */
    get isMToonMaterial() {
        return true;
    }
    /**
     * Update this material.
     *
     * @param delta deltaTime since last update
     */
    update(delta) {
        this._uploadUniformsWorkaround();
        this._updateUVAnimation(delta);
    }
    copy(source) {
        super.copy(source);
        // uniforms are already copied at this moment
        // Beginning from r133, uniform textures will be cloned instead of reference
        // See: https://github.com/mrdoob/three.js/blob/a8813be04a849bd155f7cf6f1b23d8ee2e0fb48b/examples/jsm/loaders/GLTFLoader.js#L3047
        // See: https://github.com/mrdoob/three.js/blob/a8813be04a849bd155f7cf6f1b23d8ee2e0fb48b/src/renderers/shaders/UniformsUtils.js#L22
        // This will leave their `.version` to be `0`
        // and these textures won't be uploaded to GPU
        // We are going to workaround this in here
        // I've opened an issue for this: https://github.com/mrdoob/three.js/issues/22718
        this.map = source.map;
        this.normalMap = source.normalMap;
        this.emissiveMap = source.emissiveMap;
        this.shadeMultiplyTexture = source.shadeMultiplyTexture;
        this.shadingShiftTexture = source.shadingShiftTexture;
        this.matcapTexture = source.matcapTexture;
        this.rimMultiplyTexture = source.rimMultiplyTexture;
        this.outlineWidthMultiplyTexture = source.outlineWidthMultiplyTexture;
        this.uvAnimationMaskTexture = source.uvAnimationMaskTexture;
        // == copy members =============================================================================
        this.normalMapType = source.normalMapType;
        this.uvAnimationScrollXSpeedFactor = source.uvAnimationScrollXSpeedFactor;
        this.uvAnimationScrollYSpeedFactor = source.uvAnimationScrollYSpeedFactor;
        this.uvAnimationRotationSpeedFactor = source.uvAnimationRotationSpeedFactor;
        this.ignoreVertexColor = source.ignoreVertexColor;
        this.v0CompatShade = source.v0CompatShade;
        this.debugMode = source.debugMode;
        this.outlineWidthMode = source.outlineWidthMode;
        this.isOutline = source.isOutline;
        // == update shader stuff ======================================================================
        this.needsUpdate = true;
        return this;
    }
    /**
     * Update UV animation state.
     * Intended to be called via {@link update}.
     * @param delta deltaTime
     */
    _updateUVAnimation(delta) {
        this.uniforms.uvAnimationScrollXOffset.value += delta * this.uvAnimationScrollXSpeedFactor;
        this.uniforms.uvAnimationScrollYOffset.value += delta * this.uvAnimationScrollYSpeedFactor;
        this.uniforms.uvAnimationRotationPhase.value += delta * this.uvAnimationRotationSpeedFactor;
        this.uniformsNeedUpdate = true;
    }
    /**
     * Upload uniforms that need to upload but doesn't automatically because of reasons.
     * Intended to be called via {@link constructor} and {@link update}.
     */
    _uploadUniformsWorkaround() {
        // workaround: since opacity is defined as a property in THREE.Material
        // and cannot be overridden as an accessor,
        // We are going to update opacity here
        this.uniforms.opacity.value = this.opacity;
        // workaround: texture transforms are not updated automatically
        this._updateTextureMatrix(this.uniforms.map, this.uniforms.mapUvTransform);
        this._updateTextureMatrix(this.uniforms.normalMap, this.uniforms.normalMapUvTransform);
        this._updateTextureMatrix(this.uniforms.emissiveMap, this.uniforms.emissiveMapUvTransform);
        this._updateTextureMatrix(this.uniforms.shadeMultiplyTexture, this.uniforms.shadeMultiplyTextureUvTransform);
        this._updateTextureMatrix(this.uniforms.shadingShiftTexture, this.uniforms.shadingShiftTextureUvTransform);
        this._updateTextureMatrix(this.uniforms.matcapTexture, this.uniforms.matcapTextureUvTransform);
        this._updateTextureMatrix(this.uniforms.rimMultiplyTexture, this.uniforms.rimMultiplyTextureUvTransform);
        this._updateTextureMatrix(this.uniforms.outlineWidthMultiplyTexture, this.uniforms.outlineWidthMultiplyTextureUvTransform);
        this._updateTextureMatrix(this.uniforms.uvAnimationMaskTexture, this.uniforms.uvAnimationMaskTextureUvTransform);
        // COMPAT workaround: starting from r132, alphaTest becomes a uniform instead of preprocessor value
        const threeRevision = parseInt(THREE.REVISION, 10);
        if (threeRevision >= 132) {
            this.uniforms.alphaTest.value = this.alphaTest;
        }
        this.uniformsNeedUpdate = true;
    }
    /**
     * Returns a map object of preprocessor token and macro of the shader program.
     */
    _generateDefines() {
        const threeRevision = parseInt(THREE.REVISION, 10);
        const useUvInVert = this.outlineWidthMultiplyTexture !== null;
        const useUvInFrag = this.map !== null ||
            this.emissiveMap !== null ||
            this.shadeMultiplyTexture !== null ||
            this.shadingShiftTexture !== null ||
            this.rimMultiplyTexture !== null ||
            this.uvAnimationMaskTexture !== null;
        return {
            // Temporary compat against shader change @ Three.js r126
            // See: #21205, #21307, #21299
            THREE_VRM_THREE_REVISION: threeRevision,
            OUTLINE: this._isOutline,
            MTOON_USE_UV: useUvInVert || useUvInFrag,
            MTOON_UVS_VERTEX_ONLY: useUvInVert && !useUvInFrag,
            V0_COMPAT_SHADE: this._v0CompatShade,
            USE_SHADEMULTIPLYTEXTURE: this.shadeMultiplyTexture !== null,
            USE_SHADINGSHIFTTEXTURE: this.shadingShiftTexture !== null,
            USE_MATCAPTEXTURE: this.matcapTexture !== null,
            USE_RIMMULTIPLYTEXTURE: this.rimMultiplyTexture !== null,
            USE_OUTLINEWIDTHMULTIPLYTEXTURE: this.outlineWidthMultiplyTexture !== null,
            USE_UVANIMATIONMASKTEXTURE: this.uvAnimationMaskTexture !== null,
            IGNORE_VERTEX_COLOR: this._ignoreVertexColor === true,
            DEBUG_NORMAL: this._debugMode === 'normal',
            DEBUG_LITSHADERATE: this._debugMode === 'litShadeRate',
            DEBUG_UV: this._debugMode === 'uv',
            OUTLINE_WIDTH_WORLD: this._outlineWidthMode === MToonMaterialOutlineWidthMode.WorldCoordinates,
            OUTLINE_WIDTH_SCREEN: this._outlineWidthMode === MToonMaterialOutlineWidthMode.ScreenCoordinates,
        };
    }
    _updateTextureMatrix(src, dst) {
        if (src.value) {
            if (src.value.matrixAutoUpdate) {
                src.value.updateMatrix();
            }
            dst.value.copy(src.value.matrix);
        }
    }
}

/**
 * MaterialParameters hates `undefined`. This helper automatically rejects assign of these `undefined`.
 * It also handles asynchronous process of textures.
 * Make sure await for {@link GLTFMToonMaterialParamsAssignHelper.pending}.
 */
class GLTFMToonMaterialParamsAssignHelper {
    constructor(parser, materialParams) {
        this._parser = parser;
        this._materialParams = materialParams;
        this._pendings = [];
    }
    get pending() {
        return Promise.all(this._pendings);
    }
    assignPrimitive(key, value) {
        if (value != null) {
            this._materialParams[key] = value;
        }
    }
    assignColor(key, value, convertSRGBToLinear) {
        if (value != null) {
            this._materialParams[key] = new THREE.Color().fromArray(value);
            if (convertSRGBToLinear) {
                this._materialParams[key].convertSRGBToLinear();
            }
        }
    }
    assignTexture(key, texture, isColorTexture) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = (() => __awaiter(this, void 0, void 0, function* () {
                if (texture != null) {
                    yield this._parser.assignTexture(this._materialParams, key, texture);
                    if (isColorTexture) {
                        this._materialParams[key].encoding = THREE.sRGBEncoding;
                    }
                }
            }))();
            this._pendings.push(promise);
            return promise;
        });
    }
    assignTextureByIndex(key, textureIndex, isColorTexture) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.assignTexture(key, textureIndex != null ? { index: textureIndex } : undefined, isColorTexture);
        });
    }
}

/**
 * Possible spec versions it recognizes.
 */
const POSSIBLE_SPEC_VERSIONS = new Set(['1.0', '1.0-beta']);
class MToonMaterialLoaderPlugin {
    constructor(parser, options = {}) {
        var _a, _b, _c;
        this.parser = parser;
        this.renderOrderOffset = (_a = options.renderOrderOffset) !== null && _a !== void 0 ? _a : 0;
        this.v0CompatShade = (_b = options.v0CompatShade) !== null && _b !== void 0 ? _b : false;
        this.debugMode = (_c = options.debugMode) !== null && _c !== void 0 ? _c : 'none';
        this._mToonMaterialSet = new Set();
    }
    get name() {
        return MToonMaterialLoaderPlugin.EXTENSION_NAME;
    }
    beforeRoot() {
        return __awaiter(this, void 0, void 0, function* () {
            this._removeUnlitExtensionIfMToonExists();
        });
    }
    afterRoot(gltf) {
        return __awaiter(this, void 0, void 0, function* () {
            gltf.userData.vrmMToonMaterials = Array.from(this._mToonMaterialSet);
        });
    }
    getMaterialType(materialIndex) {
        const v1Extension = this._getMToonExtension(materialIndex);
        if (v1Extension) {
            return MToonMaterial;
        }
        return null;
    }
    extendMaterialParams(materialIndex, materialParams) {
        const extension = this._getMToonExtension(materialIndex);
        if (extension) {
            return this._extendMaterialParams(extension, materialParams);
        }
        return null;
    }
    loadMesh(meshIndex) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const parser = this.parser;
            const json = parser.json;
            const meshDef = (_a = json.meshes) === null || _a === void 0 ? void 0 : _a[meshIndex];
            if (meshDef == null) {
                throw new Error(`MToonMaterialLoaderPlugin: Attempt to use meshes[${meshIndex}] of glTF but the mesh doesn't exist`);
            }
            const primitivesDef = meshDef.primitives;
            const meshOrGroup = yield parser.loadMesh(meshIndex);
            if (primitivesDef.length === 1) {
                const mesh = meshOrGroup;
                const materialIndex = primitivesDef[0].material;
                if (materialIndex != null) {
                    this._setupPrimitive(mesh, materialIndex);
                }
            }
            else {
                const group = meshOrGroup;
                for (let i = 0; i < primitivesDef.length; i++) {
                    const mesh = group.children[i];
                    const materialIndex = primitivesDef[i].material;
                    if (materialIndex != null) {
                        this._setupPrimitive(mesh, materialIndex);
                    }
                }
            }
            return meshOrGroup;
        });
    }
    /**
     * Delete use of `KHR_materials_unlit` from its `materials` if the material is using MToon.
     *
     * Since GLTFLoader have so many hardcoded procedure related to `KHR_materials_unlit`
     * we have to delete the extension before we start to parse the glTF.
     */
    _removeUnlitExtensionIfMToonExists() {
        const parser = this.parser;
        const json = parser.json;
        const materialDefs = json.materials;
        // @ts-ignore
        materialDefs === null || materialDefs === void 0 ? void 0 : materialDefs.map((materialDef, iMaterial) => {
            var _a;
            const extension = this._getMToonExtension(iMaterial);
            if (extension && ((_a = materialDef.extensions) === null || _a === void 0 ? void 0 : _a['KHR_materials_unlit'])) {
                delete materialDef.extensions['KHR_materials_unlit'];
            }
        });
    }
    _getMToonExtension(materialIndex) {
        var _a, _b;
        const parser = this.parser;
        const json = parser.json;
        const materialDef = (_a = json.materials) === null || _a === void 0 ? void 0 : _a[materialIndex];
        if (materialDef == null) {
            console.warn(`MToonMaterialLoaderPlugin: Attempt to use materials[${materialIndex}] of glTF but the material doesn't exist`);
            return undefined;
        }
        const extension = (_b = materialDef.extensions) === null || _b === void 0 ? void 0 : _b[MToonMaterialLoaderPlugin.EXTENSION_NAME];
        if (extension == null) {
            return undefined;
        }
        const specVersion = extension.specVersion;
        if (!POSSIBLE_SPEC_VERSIONS.has(specVersion)) {
            console.warn(`MToonMaterialLoaderPlugin: Unknown ${MToonMaterialLoaderPlugin.EXTENSION_NAME} specVersion "${specVersion}"`);
            return undefined;
        }
        return extension;
    }
    _extendMaterialParams(extension, materialParams) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Removing material params that is not required to supress warnings.
            delete materialParams.metalness;
            delete materialParams.roughness;
            const assignHelper = new GLTFMToonMaterialParamsAssignHelper(this.parser, materialParams);
            assignHelper.assignPrimitive('transparentWithZWrite', extension.transparentWithZWrite);
            assignHelper.assignColor('shadeColorFactor', extension.shadeColorFactor);
            assignHelper.assignTexture('shadeMultiplyTexture', extension.shadeMultiplyTexture, true);
            assignHelper.assignPrimitive('shadingShiftFactor', extension.shadingShiftFactor);
            assignHelper.assignTexture('shadingShiftTexture', extension.shadingShiftTexture, true);
            assignHelper.assignPrimitive('shadingShiftTextureScale', (_a = extension.shadingShiftTexture) === null || _a === void 0 ? void 0 : _a.scale);
            assignHelper.assignPrimitive('shadingToonyFactor', extension.shadingToonyFactor);
            assignHelper.assignPrimitive('giEqualizationFactor', extension.giEqualizationFactor);
            assignHelper.assignColor('matcapFactor', extension.matcapFactor);
            assignHelper.assignTexture('matcapTexture', extension.matcapTexture, true);
            assignHelper.assignColor('parametricRimColorFactor', extension.parametricRimColorFactor);
            assignHelper.assignTexture('rimMultiplyTexture', extension.rimMultiplyTexture, true);
            assignHelper.assignPrimitive('rimLightingMixFactor', extension.rimLightingMixFactor);
            assignHelper.assignPrimitive('parametricRimFresnelPowerFactor', extension.parametricRimFresnelPowerFactor);
            assignHelper.assignPrimitive('parametricRimLiftFactor', extension.parametricRimLiftFactor);
            assignHelper.assignPrimitive('outlineWidthMode', extension.outlineWidthMode);
            assignHelper.assignPrimitive('outlineWidthFactor', extension.outlineWidthFactor);
            assignHelper.assignTexture('outlineWidthMultiplyTexture', extension.outlineWidthMultiplyTexture, false);
            assignHelper.assignColor('outlineColorFactor', extension.outlineColorFactor);
            assignHelper.assignPrimitive('outlineLightingMixFactor', extension.outlineLightingMixFactor);
            assignHelper.assignTexture('uvAnimationMaskTexture', extension.uvAnimationMaskTexture, false);
            assignHelper.assignPrimitive('uvAnimationScrollXSpeedFactor', extension.uvAnimationScrollXSpeedFactor);
            assignHelper.assignPrimitive('uvAnimationScrollYSpeedFactor', extension.uvAnimationScrollYSpeedFactor);
            assignHelper.assignPrimitive('uvAnimationRotationSpeedFactor', extension.uvAnimationRotationSpeedFactor);
            assignHelper.assignPrimitive('v0CompatShade', this.v0CompatShade);
            assignHelper.assignPrimitive('debugMode', this.debugMode);
            yield assignHelper.pending;
        });
    }
    /**
     * This will do two processes that is required to render MToon properly.
     *
     * - Set render order
     * - Generate outline
     *
     * @param mesh A target GLTF primitive
     * @param materialIndex The material index of the primitive
     */
    _setupPrimitive(mesh, materialIndex) {
        const extension = this._getMToonExtension(materialIndex);
        if (extension) {
            const renderOrder = this._parseRenderOrder(extension);
            mesh.renderOrder = renderOrder + this.renderOrderOffset;
            this._generateOutline(mesh);
            this._addToMaterialSet(mesh);
            return;
        }
    }
    /**
     * Generate outline for the given mesh, if it needs.
     *
     * @param mesh The target mesh
     */
    _generateOutline(mesh) {
        // OK, it's the hacky part.
        // We are going to duplicate the MToonMaterial for outline use.
        // Then we are going to create two geometry groups and refer same buffer but different material.
        // It's how we draw two materials at once using a single mesh.
        // make sure the material is mtoon
        const surfaceMaterial = mesh.material;
        if (!(surfaceMaterial instanceof MToonMaterial)) {
            return;
        }
        // check whether we really have to prepare outline or not
        if (surfaceMaterial.outlineWidthMode === 'none' || surfaceMaterial.outlineWidthFactor <= 0.0) {
            return;
        }
        // make its material an array
        mesh.material = [surfaceMaterial]; // mesh.material is guaranteed to be a Material in GLTFLoader
        // duplicate the material for outline use
        const outlineMaterial = surfaceMaterial.clone();
        outlineMaterial.name += ' (Outline)';
        outlineMaterial.isOutline = true;
        outlineMaterial.side = THREE.BackSide;
        mesh.material.push(outlineMaterial);
        // make two geometry groups out of a same buffer
        const geometry = mesh.geometry; // mesh.geometry is guaranteed to be a BufferGeometry in GLTFLoader
        const primitiveVertices = geometry.index ? geometry.index.count : geometry.attributes.position.count / 3;
        geometry.addGroup(0, primitiveVertices, 0);
        geometry.addGroup(0, primitiveVertices, 1);
    }
    _addToMaterialSet(mesh) {
        const materialOrMaterials = mesh.material;
        const materialSet = new Set();
        if (Array.isArray(materialOrMaterials)) {
            materialOrMaterials.forEach((material) => materialSet.add(material));
        }
        else {
            materialSet.add(materialOrMaterials);
        }
        for (const material of materialSet) {
            if (material instanceof MToonMaterial) {
                this._mToonMaterialSet.add(material);
            }
        }
    }
    _parseRenderOrder(extension) {
        var _a;
        // transparentWithZWrite ranges from 0 to +9
        // mere transparent ranges from -9 to 0
        const enabledZWrite = extension.transparentWithZWrite;
        return (enabledZWrite ? 0 : 19) + ((_a = extension.renderQueueOffsetNumber) !== null && _a !== void 0 ? _a : 0);
    }
}
MToonMaterialLoaderPlugin.EXTENSION_NAME = 'VRMC_materials_mtoon';

export { MToonMaterial, MToonMaterialDebugMode, MToonMaterialLoaderPlugin, MToonMaterialOutlineWidthMode };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyZWUtdnJtLW1hdGVyaWFscy1tdG9vbi5tb2R1bGUuanMiLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy90c2xpYi90c2xpYi5lczYuanMiLCIuLi9zcmMvTVRvb25NYXRlcmlhbERlYnVnTW9kZS50cyIsIi4uL3NyYy9NVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZS50cyIsIi4uL3NyYy91dGlscy9nZXRUZXhlbERlY29kaW5nRnVuY3Rpb24udHMiLCIuLi9zcmMvdXRpbHMvZ2V0VGV4dHVyZUVuY29kaW5nRnJvbU1hcC50cyIsIi4uL3NyYy9NVG9vbk1hdGVyaWFsLnRzIiwiLi4vc3JjL0dMVEZNVG9vbk1hdGVyaWFsUGFyYW1zQXNzaWduSGVscGVyLnRzIiwiLi4vc3JjL01Ub29uTWF0ZXJpYWxMb2FkZXJQbHVnaW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEluKHN0YXRlLCByZWNlaXZlcikge1xyXG4gICAgaWYgKHJlY2VpdmVyID09PSBudWxsIHx8ICh0eXBlb2YgcmVjZWl2ZXIgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlY2VpdmVyICE9PSBcImZ1bmN0aW9uXCIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSAnaW4nIG9wZXJhdG9yIG9uIG5vbi1vYmplY3RcIik7XHJcbiAgICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciA9PT0gc3RhdGUgOiBzdGF0ZS5oYXMocmVjZWl2ZXIpO1xyXG59XHJcbiIsIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiAqL1xuXG4vKipcbiAqIFNwZWNpZmllcnMgb2YgZGVidWcgbW9kZSBvZiB7QGxpbmsgTVRvb25NYXRlcmlhbH0uXG4gKlxuICogU2VlOiB7QGxpbmsgTVRvb25NYXRlcmlhbC5kZWJ1Z01vZGV9XG4gKi9cbmV4cG9ydCBjb25zdCBNVG9vbk1hdGVyaWFsRGVidWdNb2RlID0ge1xuICAvKipcbiAgICogUmVuZGVyIG5vcm1hbGx5LlxuICAgKi9cbiAgTm9uZTogJ25vbmUnLFxuXG4gIC8qKlxuICAgKiBWaXN1YWxpemUgbm9ybWFscyBvZiB0aGUgc3VyZmFjZS5cbiAgICovXG4gIE5vcm1hbDogJ25vcm1hbCcsXG5cbiAgLyoqXG4gICAqIFZpc3VhbGl6ZSBsaXQvc2hhZGUgb2YgdGhlIHN1cmZhY2UuXG4gICAqL1xuICBMaXRTaGFkZVJhdGU6ICdsaXRTaGFkZVJhdGUnLFxuXG4gIC8qKlxuICAgKiBWaXN1YWxpemUgVVYgb2YgdGhlIHN1cmZhY2UuXG4gICAqL1xuICBVVjogJ3V2Jyxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIE1Ub29uTWF0ZXJpYWxEZWJ1Z01vZGUgPSB0eXBlb2YgTVRvb25NYXRlcmlhbERlYnVnTW9kZVtrZXlvZiB0eXBlb2YgTVRvb25NYXRlcmlhbERlYnVnTW9kZV07XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cblxuZXhwb3J0IGNvbnN0IE1Ub29uTWF0ZXJpYWxPdXRsaW5lV2lkdGhNb2RlID0ge1xuICBOb25lOiAnbm9uZScsXG4gIFdvcmxkQ29vcmRpbmF0ZXM6ICd3b3JsZENvb3JkaW5hdGVzJyxcbiAgU2NyZWVuQ29vcmRpbmF0ZXM6ICdzY3JlZW5Db29yZGluYXRlcycsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgdHlwZSBNVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZSA9IHR5cGVvZiBNVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZVtrZXlvZiB0eXBlb2YgTVRvb25NYXRlcmlhbE91dGxpbmVXaWR0aE1vZGVdO1xuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuXG4vLyBTaW5jZSB0aGVzZSBjb25zdGFudHMgYXJlIGRlbGV0ZWQgaW4gcjEzNiB3ZSBoYXZlIHRvIGRlZmluZSBieSBvdXJzZWx2ZXNcbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiAqL1xuY29uc3QgUkdCRUVuY29kaW5nID0gMzAwMjtcbmNvbnN0IFJHQk03RW5jb2RpbmcgPSAzMDA0O1xuY29uc3QgUkdCTTE2RW5jb2RpbmcgPSAzMDA1O1xuY29uc3QgUkdCREVuY29kaW5nID0gMzAwNjtcbmNvbnN0IEdhbW1hRW5jb2RpbmcgPSAzMDA3O1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cblxuLyoqXG4gKiBDT01QQVQ6IHByZS1yMTM3XG4gKlxuICogUmVmOiBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2Jsb2IvcjEzNi9zcmMvcmVuZGVyZXJzL3dlYmdsL1dlYkdMUHJvZ3JhbS5qcyNMMjJcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVuY29kaW5nQ29tcG9uZW50cyA9IChlbmNvZGluZzogVEhSRUUuVGV4dHVyZUVuY29kaW5nKTogW3N0cmluZywgc3RyaW5nXSA9PiB7XG4gIGlmIChwYXJzZUludChUSFJFRS5SRVZJU0lPTiwgMTApID49IDEzNikge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgVEhSRUUuTGluZWFyRW5jb2Rpbmc6XG4gICAgICAgIHJldHVybiBbJ0xpbmVhcicsICcoIHZhbHVlICknXTtcbiAgICAgIGNhc2UgVEhSRUUuc1JHQkVuY29kaW5nOlxuICAgICAgICByZXR1cm4gWydzUkdCJywgJyggdmFsdWUgKSddO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29uc29sZS53YXJuKCdUSFJFRS5XZWJHTFByb2dyYW06IFVuc3VwcG9ydGVkIGVuY29kaW5nOicsIGVuY29kaW5nKTtcbiAgICAgICAgcmV0dXJuIFsnTGluZWFyJywgJyggdmFsdWUgKSddO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICAvLyBDT01QQVQ6IHByZS1yMTM2XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSBUSFJFRS5MaW5lYXJFbmNvZGluZzpcbiAgICAgICAgcmV0dXJuIFsnTGluZWFyJywgJyggdmFsdWUgKSddO1xuICAgICAgY2FzZSBUSFJFRS5zUkdCRW5jb2Rpbmc6XG4gICAgICAgIHJldHVybiBbJ3NSR0InLCAnKCB2YWx1ZSApJ107XG4gICAgICBjYXNlIFJHQkVFbmNvZGluZzpcbiAgICAgICAgcmV0dXJuIFsnUkdCRScsICcoIHZhbHVlICknXTtcbiAgICAgIGNhc2UgUkdCTTdFbmNvZGluZzpcbiAgICAgICAgcmV0dXJuIFsnUkdCTScsICcoIHZhbHVlLCA3LjAgKSddO1xuICAgICAgY2FzZSBSR0JNMTZFbmNvZGluZzpcbiAgICAgICAgcmV0dXJuIFsnUkdCTScsICcoIHZhbHVlLCAxNi4wICknXTtcbiAgICAgIGNhc2UgUkdCREVuY29kaW5nOlxuICAgICAgICByZXR1cm4gWydSR0JEJywgJyggdmFsdWUsIDI1Ni4wICknXTtcbiAgICAgIGNhc2UgR2FtbWFFbmNvZGluZzpcbiAgICAgICAgcmV0dXJuIFsnR2FtbWEnLCAnKCB2YWx1ZSwgZmxvYXQoIEdBTU1BX0ZBQ1RPUiApICknXTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgZW5jb2Rpbmc6ICcgKyBlbmNvZGluZyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENPTVBBVDogcHJlLXIxMzdcbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIG5vIGxvbmdlciByZXF1aXJlZCBiZWdpbm5pbmcgZnJvbSByMTM3XG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iL3IxMzYvc3JjL3JlbmRlcmVycy93ZWJnbC9XZWJHTFByb2dyYW0uanMjTDUyXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRUZXhlbERlY29kaW5nRnVuY3Rpb24gPSAoZnVuY3Rpb25OYW1lOiBzdHJpbmcsIGVuY29kaW5nOiBUSFJFRS5UZXh0dXJlRW5jb2RpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBjb21wb25lbnRzID0gZ2V0RW5jb2RpbmdDb21wb25lbnRzKGVuY29kaW5nKTtcbiAgcmV0dXJuICd2ZWM0ICcgKyBmdW5jdGlvbk5hbWUgKyAnKCB2ZWM0IHZhbHVlICkgeyByZXR1cm4gJyArIGNvbXBvbmVudHNbMF0gKyAnVG9MaW5lYXInICsgY29tcG9uZW50c1sxXSArICc7IH0nO1xufTtcbiIsImltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcblxuLyoqXG4gKiBDT01QQVQ6IHByZS1yMTM3XG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBubyBsb25nZXIgcmVxdWlyZWQgYmVnaW5uaW5nIGZyb20gcjEzN1xuICpcbiAqIFJldHJpZXZlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi84OGI2MzI4OTk4ZDE1NWZhMGE3YzFmMWU1ZTNiZDZiZmY3NTI2OGMwL3NyYy9yZW5kZXJlcnMvd2ViZ2wvV2ViR0xQcm9ncmFtcy5qcyNMOTJcbiAqXG4gKiBEaWZmOlxuICogICAtIFJlbW92ZSBXZWJHTFJlbmRlclRhcmdldCBoYW5kbGVyIGJlY2F1c2UgaXQgaW5jcmVhc2VzIGNvZGUgY29tcGxleGl0aWVzIG9uIFR5cGVTY3JpcHRcbiAqICAgLSBBZGQgYSBib29sZWFuIGBpc1dlYkdMMmAgYXMgYSBzZWNvbmQgYXJndW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0dXJlRW5jb2RpbmdGcm9tTWFwKG1hcDogVEhSRUUuVGV4dHVyZSwgaXNXZWJHTDI6IGJvb2xlYW4pOiBUSFJFRS5UZXh0dXJlRW5jb2Rpbmcge1xuICBsZXQgZW5jb2Rpbmc7XG5cbiAgaWYgKG1hcCAmJiBtYXAuaXNUZXh0dXJlKSB7XG4gICAgZW5jb2RpbmcgPSBtYXAuZW5jb2Rpbmc7XG4gICAgLy8gfSBlbHNlIGlmICggbWFwICYmIG1hcC5pc1dlYkdMUmVuZGVyVGFyZ2V0ICkge1xuICAgIC8vICAgY29uc29sZS53YXJuKCAnVEhSRUUuV2ViR0xQcm9ncmFtcy5nZXRUZXh0dXJlRW5jb2RpbmdGcm9tTWFwOiBkb25cXCd0IHVzZSByZW5kZXIgdGFyZ2V0cyBhcyB0ZXh0dXJlcy4gVXNlIHRoZWlyIC50ZXh0dXJlIHByb3BlcnR5IGluc3RlYWQuJyApO1xuICAgIC8vICAgZW5jb2RpbmcgPSBtYXAudGV4dHVyZS5lbmNvZGluZztcbiAgfSBlbHNlIHtcbiAgICBlbmNvZGluZyA9IFRIUkVFLkxpbmVhckVuY29kaW5nO1xuICB9XG5cbiAgaWYgKHBhcnNlSW50KFRIUkVFLlJFVklTSU9OLCAxMCkgPj0gMTMzKSB7XG4gICAgaWYgKFxuICAgICAgaXNXZWJHTDIgJiZcbiAgICAgIG1hcCAmJlxuICAgICAgbWFwLmlzVGV4dHVyZSAmJlxuICAgICAgbWFwLmZvcm1hdCA9PT0gVEhSRUUuUkdCQUZvcm1hdCAmJlxuICAgICAgbWFwLnR5cGUgPT09IFRIUkVFLlVuc2lnbmVkQnl0ZVR5cGUgJiZcbiAgICAgIG1hcC5lbmNvZGluZyA9PT0gVEhSRUUuc1JHQkVuY29kaW5nXG4gICAgKSB7XG4gICAgICBlbmNvZGluZyA9IFRIUkVFLkxpbmVhckVuY29kaW5nOyAvLyBkaXNhYmxlIGlubGluZSBkZWNvZGUgZm9yIHNSR0IgdGV4dHVyZXMgaW4gV2ViR0wgMlxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBlbmNvZGluZztcbn1cbiIsIi8qIHRzbGludDpkaXNhYmxlOm1lbWJlci1vcmRlcmluZyAqL1xuXG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSc7XG5pbXBvcnQgdmVydGV4U2hhZGVyIGZyb20gJy4vc2hhZGVycy9tdG9vbi52ZXJ0JztcbmltcG9ydCBmcmFnbWVudFNoYWRlciBmcm9tICcuL3NoYWRlcnMvbXRvb24uZnJhZyc7XG5pbXBvcnQgeyBNVG9vbk1hdGVyaWFsRGVidWdNb2RlIH0gZnJvbSAnLi9NVG9vbk1hdGVyaWFsRGVidWdNb2RlJztcbmltcG9ydCB7IE1Ub29uTWF0ZXJpYWxPdXRsaW5lV2lkdGhNb2RlIH0gZnJvbSAnLi9NVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZSc7XG5pbXBvcnQgdHlwZSB7IE1Ub29uTWF0ZXJpYWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9NVG9vbk1hdGVyaWFsUGFyYW1ldGVycyc7XG5pbXBvcnQgeyBnZXRUZXhlbERlY29kaW5nRnVuY3Rpb24gfSBmcm9tICcuL3V0aWxzL2dldFRleGVsRGVjb2RpbmdGdW5jdGlvbic7XG5pbXBvcnQgeyBnZXRUZXh0dXJlRW5jb2RpbmdGcm9tTWFwIH0gZnJvbSAnLi91dGlscy9nZXRUZXh0dXJlRW5jb2RpbmdGcm9tTWFwJztcblxuLyoqXG4gKiBNVG9vbiBpcyBhIG1hdGVyaWFsIHNwZWNpZmljYXRpb24gdGhhdCBoYXMgdmFyaW91cyBmZWF0dXJlcy5cbiAqIFRoZSBzcGVjIGFuZCBpbXBsZW1lbnRhdGlvbiBhcmUgb3JpZ2luYWxseSBmb3VuZGVkIGZvciBVbml0eSBlbmdpbmUgYW5kIHRoaXMgaXMgYSBwb3J0IG9mIHRoZSBtYXRlcmlhbC5cbiAqXG4gKiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9TYW50YXJoL01Ub29uXG4gKi9cbmV4cG9ydCBjbGFzcyBNVG9vbk1hdGVyaWFsIGV4dGVuZHMgVEhSRUUuU2hhZGVyTWF0ZXJpYWwge1xuICBwdWJsaWMgdW5pZm9ybXM6IHtcbiAgICBsaXRGYWN0b3I6IFRIUkVFLklVbmlmb3JtPFRIUkVFLkNvbG9yPjtcbiAgICBhbHBoYVRlc3Q6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gICAgb3BhY2l0eTogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgICBtYXA6IFRIUkVFLklVbmlmb3JtPFRIUkVFLlRleHR1cmUgfCBudWxsPjtcbiAgICBtYXBVdlRyYW5zZm9ybTogVEhSRUUuSVVuaWZvcm08VEhSRUUuTWF0cml4Mz47XG4gICAgbm9ybWFsTWFwOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5UZXh0dXJlIHwgbnVsbD47XG4gICAgbm9ybWFsTWFwVXZUcmFuc2Zvcm06IFRIUkVFLklVbmlmb3JtPFRIUkVFLk1hdHJpeDM+O1xuICAgIG5vcm1hbFNjYWxlOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5WZWN0b3IyPjtcbiAgICBlbWlzc2l2ZTogVEhSRUUuSVVuaWZvcm08VEhSRUUuQ29sb3I+O1xuICAgIGVtaXNzaXZlSW50ZW5zaXR5OiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICAgIGVtaXNzaXZlTWFwOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5UZXh0dXJlIHwgbnVsbD47XG4gICAgZW1pc3NpdmVNYXBVdlRyYW5zZm9ybTogVEhSRUUuSVVuaWZvcm08VEhSRUUuTWF0cml4Mz47XG4gICAgc2hhZGVDb2xvckZhY3RvcjogVEhSRUUuSVVuaWZvcm08VEhSRUUuQ29sb3I+O1xuICAgIHNoYWRlTXVsdGlwbHlUZXh0dXJlOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5UZXh0dXJlIHwgbnVsbD47XG4gICAgc2hhZGVNdWx0aXBseVRleHR1cmVVdlRyYW5zZm9ybTogVEhSRUUuSVVuaWZvcm08VEhSRUUuTWF0cml4Mz47XG4gICAgc2hhZGluZ1NoaWZ0RmFjdG9yOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICAgIHNoYWRpbmdTaGlmdFRleHR1cmU6IFRIUkVFLklVbmlmb3JtPFRIUkVFLlRleHR1cmUgfCBudWxsPjtcbiAgICBzaGFkaW5nU2hpZnRUZXh0dXJlVXZUcmFuc2Zvcm06IFRIUkVFLklVbmlmb3JtPFRIUkVFLk1hdHJpeDM+O1xuICAgIHNoYWRpbmdTaGlmdFRleHR1cmVTY2FsZTogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgICBzaGFkaW5nVG9vbnlGYWN0b3I6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gICAgZ2lFcXVhbGl6YXRpb25GYWN0b3I6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gICAgbWF0Y2FwRmFjdG9yOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5Db2xvcj47XG4gICAgbWF0Y2FwVGV4dHVyZTogVEhSRUUuSVVuaWZvcm08VEhSRUUuVGV4dHVyZSB8IG51bGw+O1xuICAgIG1hdGNhcFRleHR1cmVVdlRyYW5zZm9ybTogVEhSRUUuSVVuaWZvcm08VEhSRUUuTWF0cml4Mz47XG4gICAgcGFyYW1ldHJpY1JpbUNvbG9yRmFjdG9yOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5Db2xvcj47XG4gICAgcmltTXVsdGlwbHlUZXh0dXJlOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5UZXh0dXJlIHwgbnVsbD47XG4gICAgcmltTXVsdGlwbHlUZXh0dXJlVXZUcmFuc2Zvcm06IFRIUkVFLklVbmlmb3JtPFRIUkVFLk1hdHJpeDM+O1xuICAgIHJpbUxpZ2h0aW5nTWl4RmFjdG9yOiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICAgIHBhcmFtZXRyaWNSaW1GcmVzbmVsUG93ZXJGYWN0b3I6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gICAgcGFyYW1ldHJpY1JpbUxpZnRGYWN0b3I6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gICAgb3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlOiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5UZXh0dXJlIHwgbnVsbD47XG4gICAgb3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlVXZUcmFuc2Zvcm06IFRIUkVFLklVbmlmb3JtPFRIUkVFLk1hdHJpeDM+O1xuICAgIG91dGxpbmVXaWR0aEZhY3RvcjogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgICBvdXRsaW5lQ29sb3JGYWN0b3I6IFRIUkVFLklVbmlmb3JtPFRIUkVFLkNvbG9yPjtcbiAgICBvdXRsaW5lTGlnaHRpbmdNaXhGYWN0b3I6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gICAgdXZBbmltYXRpb25NYXNrVGV4dHVyZTogVEhSRUUuSVVuaWZvcm08VEhSRUUuVGV4dHVyZSB8IG51bGw+O1xuICAgIHV2QW5pbWF0aW9uTWFza1RleHR1cmVVdlRyYW5zZm9ybTogVEhSRUUuSVVuaWZvcm08VEhSRUUuTWF0cml4Mz47XG4gICAgdXZBbmltYXRpb25TY3JvbGxYT2Zmc2V0OiBUSFJFRS5JVW5pZm9ybTxudW1iZXI+O1xuICAgIHV2QW5pbWF0aW9uU2Nyb2xsWU9mZnNldDogVEhSRUUuSVVuaWZvcm08bnVtYmVyPjtcbiAgICB1dkFuaW1hdGlvblJvdGF0aW9uUGhhc2U6IFRIUkVFLklVbmlmb3JtPG51bWJlcj47XG4gIH07XG5cbiAgcHVibGljIGdldCBjb2xvcigpOiBUSFJFRS5Db2xvciB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXMubGl0RmFjdG9yLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgY29sb3IodmFsdWU6IFRIUkVFLkNvbG9yKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5saXRGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWFwKCk6IFRIUkVFLlRleHR1cmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5tYXAudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBtYXAodmFsdWU6IFRIUkVFLlRleHR1cmUgfCBudWxsKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5tYXAudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbm9ybWFsTWFwKCk6IFRIUkVFLlRleHR1cmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5ub3JtYWxNYXAudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBub3JtYWxNYXAodmFsdWU6IFRIUkVFLlRleHR1cmUgfCBudWxsKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5ub3JtYWxNYXAudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbm9ybWFsU2NhbGUoKTogVEhSRUUuVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXMubm9ybWFsU2NhbGUudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBub3JtYWxTY2FsZSh2YWx1ZTogVEhSRUUuVmVjdG9yMikge1xuICAgIHRoaXMudW5pZm9ybXMubm9ybWFsU2NhbGUudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW1pc3NpdmUoKTogVEhSRUUuQ29sb3Ige1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLmVtaXNzaXZlLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgZW1pc3NpdmUodmFsdWU6IFRIUkVFLkNvbG9yKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5lbWlzc2l2ZS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBlbWlzc2l2ZUludGVuc2l0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLmVtaXNzaXZlSW50ZW5zaXR5LnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgZW1pc3NpdmVJbnRlbnNpdHkodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMudW5pZm9ybXMuZW1pc3NpdmVJbnRlbnNpdHkudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW1pc3NpdmVNYXAoKTogVEhSRUUuVGV4dHVyZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLmVtaXNzaXZlTWFwLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgZW1pc3NpdmVNYXAodmFsdWU6IFRIUkVFLlRleHR1cmUgfCBudWxsKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5lbWlzc2l2ZU1hcC52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBzaGFkZUNvbG9yRmFjdG9yKCk6IFRIUkVFLkNvbG9yIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5zaGFkZUNvbG9yRmFjdG9yLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgc2hhZGVDb2xvckZhY3Rvcih2YWx1ZTogVEhSRUUuQ29sb3IpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnNoYWRlQ29sb3JGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2hhZGVNdWx0aXBseVRleHR1cmUoKTogVEhSRUUuVGV4dHVyZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnNoYWRlTXVsdGlwbHlUZXh0dXJlLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgc2hhZGVNdWx0aXBseVRleHR1cmUodmFsdWU6IFRIUkVFLlRleHR1cmUgfCBudWxsKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5zaGFkZU11bHRpcGx5VGV4dHVyZS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBzaGFkaW5nU2hpZnRGYWN0b3IoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5zaGFkaW5nU2hpZnRGYWN0b3IudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBzaGFkaW5nU2hpZnRGYWN0b3IodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMudW5pZm9ybXMuc2hhZGluZ1NoaWZ0RmFjdG9yLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNoYWRpbmdTaGlmdFRleHR1cmUoKTogVEhSRUUuVGV4dHVyZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnNoYWRpbmdTaGlmdFRleHR1cmUudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBzaGFkaW5nU2hpZnRUZXh0dXJlKHZhbHVlOiBUSFJFRS5UZXh0dXJlIHwgbnVsbCkge1xuICAgIHRoaXMudW5pZm9ybXMuc2hhZGluZ1NoaWZ0VGV4dHVyZS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBzaGFkaW5nU2hpZnRUZXh0dXJlU2NhbGUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5zaGFkaW5nU2hpZnRUZXh0dXJlU2NhbGUudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBzaGFkaW5nU2hpZnRUZXh0dXJlU2NhbGUodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMudW5pZm9ybXMuc2hhZGluZ1NoaWZ0VGV4dHVyZVNjYWxlLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNoYWRpbmdUb29ueUZhY3RvcigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnNoYWRpbmdUb29ueUZhY3Rvci52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IHNoYWRpbmdUb29ueUZhY3Rvcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5zaGFkaW5nVG9vbnlGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZ2lFcXVhbGl6YXRpb25GYWN0b3IoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5naUVxdWFsaXphdGlvbkZhY3Rvci52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IGdpRXF1YWxpemF0aW9uRmFjdG9yKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnVuaWZvcm1zLmdpRXF1YWxpemF0aW9uRmFjdG9yLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1hdGNhcEZhY3RvcigpOiBUSFJFRS5Db2xvciB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXMubWF0Y2FwRmFjdG9yLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgbWF0Y2FwRmFjdG9yKHZhbHVlOiBUSFJFRS5Db2xvcikge1xuICAgIHRoaXMudW5pZm9ybXMubWF0Y2FwRmFjdG9yLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1hdGNhcFRleHR1cmUoKTogVEhSRUUuVGV4dHVyZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLm1hdGNhcFRleHR1cmUudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBtYXRjYXBUZXh0dXJlKHZhbHVlOiBUSFJFRS5UZXh0dXJlIHwgbnVsbCkge1xuICAgIHRoaXMudW5pZm9ybXMubWF0Y2FwVGV4dHVyZS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBwYXJhbWV0cmljUmltQ29sb3JGYWN0b3IoKTogVEhSRUUuQ29sb3Ige1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnBhcmFtZXRyaWNSaW1Db2xvckZhY3Rvci52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IHBhcmFtZXRyaWNSaW1Db2xvckZhY3Rvcih2YWx1ZTogVEhSRUUuQ29sb3IpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnBhcmFtZXRyaWNSaW1Db2xvckZhY3Rvci52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCByaW1NdWx0aXBseVRleHR1cmUoKTogVEhSRUUuVGV4dHVyZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnJpbU11bHRpcGx5VGV4dHVyZS52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IHJpbU11bHRpcGx5VGV4dHVyZSh2YWx1ZTogVEhSRUUuVGV4dHVyZSB8IG51bGwpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnJpbU11bHRpcGx5VGV4dHVyZS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCByaW1MaWdodGluZ01peEZhY3RvcigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnJpbUxpZ2h0aW5nTWl4RmFjdG9yLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgcmltTGlnaHRpbmdNaXhGYWN0b3IodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMudW5pZm9ybXMucmltTGlnaHRpbmdNaXhGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGFyYW1ldHJpY1JpbUZyZXNuZWxQb3dlckZhY3RvcigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnBhcmFtZXRyaWNSaW1GcmVzbmVsUG93ZXJGYWN0b3IudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBwYXJhbWV0cmljUmltRnJlc25lbFBvd2VyRmFjdG9yKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnBhcmFtZXRyaWNSaW1GcmVzbmVsUG93ZXJGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcGFyYW1ldHJpY1JpbUxpZnRGYWN0b3IoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5wYXJhbWV0cmljUmltTGlmdEZhY3Rvci52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IHBhcmFtZXRyaWNSaW1MaWZ0RmFjdG9yKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnBhcmFtZXRyaWNSaW1MaWZ0RmFjdG9yLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG91dGxpbmVXaWR0aE11bHRpcGx5VGV4dHVyZSgpOiBUSFJFRS5UZXh0dXJlIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXMub3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgb3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlKHZhbHVlOiBUSFJFRS5UZXh0dXJlIHwgbnVsbCkge1xuICAgIHRoaXMudW5pZm9ybXMub3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG91dGxpbmVXaWR0aEZhY3RvcigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLm91dGxpbmVXaWR0aEZhY3Rvci52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IG91dGxpbmVXaWR0aEZhY3Rvcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5vdXRsaW5lV2lkdGhGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgb3V0bGluZUNvbG9yRmFjdG9yKCk6IFRIUkVFLkNvbG9yIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy5vdXRsaW5lQ29sb3JGYWN0b3IudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCBvdXRsaW5lQ29sb3JGYWN0b3IodmFsdWU6IFRIUkVFLkNvbG9yKSB7XG4gICAgdGhpcy51bmlmb3Jtcy5vdXRsaW5lQ29sb3JGYWN0b3IudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgb3V0bGluZUxpZ2h0aW5nTWl4RmFjdG9yKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXMub3V0bGluZUxpZ2h0aW5nTWl4RmFjdG9yLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgb3V0bGluZUxpZ2h0aW5nTWl4RmFjdG9yKHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnVuaWZvcm1zLm91dGxpbmVMaWdodGluZ01peEZhY3Rvci52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCB1dkFuaW1hdGlvbk1hc2tUZXh0dXJlKCk6IFRIUkVFLlRleHR1cmUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy51dkFuaW1hdGlvbk1hc2tUZXh0dXJlLnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgdXZBbmltYXRpb25NYXNrVGV4dHVyZSh2YWx1ZTogVEhSRUUuVGV4dHVyZSB8IG51bGwpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnV2QW5pbWF0aW9uTWFza1RleHR1cmUudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdXZBbmltYXRpb25TY3JvbGxYT2Zmc2V0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudW5pZm9ybXMudXZBbmltYXRpb25TY3JvbGxYT2Zmc2V0LnZhbHVlO1xuICB9XG4gIHB1YmxpYyBzZXQgdXZBbmltYXRpb25TY3JvbGxYT2Zmc2V0KHZhbHVlOiBudW1iZXIpIHtcbiAgICB0aGlzLnVuaWZvcm1zLnV2QW5pbWF0aW9uU2Nyb2xsWE9mZnNldC52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCB1dkFuaW1hdGlvblNjcm9sbFlPZmZzZXQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy51bmlmb3Jtcy51dkFuaW1hdGlvblNjcm9sbFlPZmZzZXQudmFsdWU7XG4gIH1cbiAgcHVibGljIHNldCB1dkFuaW1hdGlvblNjcm9sbFlPZmZzZXQodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMudW5pZm9ybXMudXZBbmltYXRpb25TY3JvbGxZT2Zmc2V0LnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHV2QW5pbWF0aW9uUm90YXRpb25QaGFzZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnVuaWZvcm1zLnV2QW5pbWF0aW9uUm90YXRpb25QaGFzZS52YWx1ZTtcbiAgfVxuICBwdWJsaWMgc2V0IHV2QW5pbWF0aW9uUm90YXRpb25QaGFzZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy51bmlmb3Jtcy51dkFuaW1hdGlvblJvdGF0aW9uUGhhc2UudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyB1dkFuaW1hdGlvblNjcm9sbFhTcGVlZEZhY3RvciA9IDAuMDtcbiAgcHVibGljIHV2QW5pbWF0aW9uU2Nyb2xsWVNwZWVkRmFjdG9yID0gMC4wO1xuICBwdWJsaWMgdXZBbmltYXRpb25Sb3RhdGlvblNwZWVkRmFjdG9yID0gMC4wO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBtYXRlcmlhbCBpcyBhZmZlY3RlZCBieSBmb2cuXG4gICAqIGB0cnVlYCBieSBkZWZhdWx0LlxuICAgKi9cbiAgcHVibGljIGZvZyA9IHRydWU7XG5cbiAgLyoqXG4gICAqIFdpbGwgYmUgcmVhZCBpbiBXZWJHTFByb2dyYW1zXG4gICAqXG4gICAqIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9ibG9iLzRmNTIzNmFjM2Q2ZjQxZDkwNGFhNTg0MDFiNDA1NTRlOGZiZGNiMTUvc3JjL3JlbmRlcmVycy93ZWJnbC9XZWJHTFByb2dyYW1zLmpzI0wxOTAtTDE5MVxuICAgKi9cbiAgcHVibGljIG5vcm1hbE1hcFR5cGUgPSBUSFJFRS5UYW5nZW50U3BhY2VOb3JtYWxNYXA7XG5cbiAgLyoqXG4gICAqIFdoZW4gdGhpcyBpcyBgdHJ1ZWAsIHZlcnRleCBjb2xvcnMgd2lsbCBiZSBpZ25vcmVkLlxuICAgKiBgdHJ1ZWAgYnkgZGVmYXVsdC5cbiAgICovXG4gIHByaXZhdGUgX2lnbm9yZVZlcnRleENvbG9yID0gdHJ1ZTtcblxuICAvKipcbiAgICogV2hlbiB0aGlzIGlzIGB0cnVlYCwgdmVydGV4IGNvbG9ycyB3aWxsIGJlIGlnbm9yZWQuXG4gICAqIGB0cnVlYCBieSBkZWZhdWx0LlxuICAgKi9cbiAgcHVibGljIGdldCBpZ25vcmVWZXJ0ZXhDb2xvcigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faWdub3JlVmVydGV4Q29sb3I7XG4gIH1cbiAgcHVibGljIHNldCBpZ25vcmVWZXJ0ZXhDb2xvcih2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX2lnbm9yZVZlcnRleENvbG9yID0gdmFsdWU7XG5cbiAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3YwQ29tcGF0U2hhZGUgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlcmUgaXMgYSBsaW5lIG9mIHRoZSBzaGFkZXIgY2FsbGVkIFwiY29tbWVudCBvdXQgaWYgeW91IHdhbnQgdG8gUEJSIGFic29sdXRlbHlcIiBpbiBWUk0wLjAgTVRvb24uXG4gICAqIFdoZW4gdGhpcyBpcyB0cnVlLCB0aGUgbWF0ZXJpYWwgZW5hYmxlcyB0aGUgbGluZSB0byBtYWtlIGl0IGNvbXBhdGlibGUgd2l0aCB0aGUgbGVnYWN5IHJlbmRlcmluZyBvZiBWUk0uXG4gICAqIFVzdWFsbHkgbm90IHJlY29tbWVuZGVkIHRvIHR1cm4gdGhpcyBvbi5cbiAgICogYGZhbHNlYCBieSBkZWZhdWx0LlxuICAgKi9cbiAgZ2V0IHYwQ29tcGF0U2hhZGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3YwQ29tcGF0U2hhZGU7XG4gIH1cblxuICAvKipcbiAgICogVGhlcmUgaXMgYSBsaW5lIG9mIHRoZSBzaGFkZXIgY2FsbGVkIFwiY29tbWVudCBvdXQgaWYgeW91IHdhbnQgdG8gUEJSIGFic29sdXRlbHlcIiBpbiBWUk0wLjAgTVRvb24uXG4gICAqIFdoZW4gdGhpcyBpcyB0cnVlLCB0aGUgbWF0ZXJpYWwgZW5hYmxlcyB0aGUgbGluZSB0byBtYWtlIGl0IGNvbXBhdGlibGUgd2l0aCB0aGUgbGVnYWN5IHJlbmRlcmluZyBvZiBWUk0uXG4gICAqIFVzdWFsbHkgbm90IHJlY29tbWVuZGVkIHRvIHR1cm4gdGhpcyBvbi5cbiAgICogYGZhbHNlYCBieSBkZWZhdWx0LlxuICAgKi9cbiAgc2V0IHYwQ29tcGF0U2hhZGUodjogYm9vbGVhbikge1xuICAgIHRoaXMuX3YwQ29tcGF0U2hhZGUgPSB2O1xuXG4gICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIF9kZWJ1Z01vZGU6IE1Ub29uTWF0ZXJpYWxEZWJ1Z01vZGUgPSBNVG9vbk1hdGVyaWFsRGVidWdNb2RlLk5vbmU7XG5cbiAgLyoqXG4gICAqIERlYnVnIG1vZGUgZm9yIHRoZSBtYXRlcmlhbC5cbiAgICogWW91IGNhbiB2aXN1YWxpemUgc2V2ZXJhbCBjb21wb25lbnRzIGZvciBkaWFnbm9zaXMgdXNpbmcgZGVidWcgbW9kZS5cbiAgICpcbiAgICogU2VlOiB7QGxpbmsgTVRvb25NYXRlcmlhbERlYnVnTW9kZX1cbiAgICovXG4gIGdldCBkZWJ1Z01vZGUoKTogTVRvb25NYXRlcmlhbERlYnVnTW9kZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RlYnVnTW9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWJ1ZyBtb2RlIGZvciB0aGUgbWF0ZXJpYWwuXG4gICAqIFlvdSBjYW4gdmlzdWFsaXplIHNldmVyYWwgY29tcG9uZW50cyBmb3IgZGlhZ25vc2lzIHVzaW5nIGRlYnVnIG1vZGUuXG4gICAqXG4gICAqIFNlZToge0BsaW5rIE1Ub29uTWF0ZXJpYWxEZWJ1Z01vZGV9XG4gICAqL1xuICBzZXQgZGVidWdNb2RlKG06IE1Ub29uTWF0ZXJpYWxEZWJ1Z01vZGUpIHtcbiAgICB0aGlzLl9kZWJ1Z01vZGUgPSBtO1xuXG4gICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIF9vdXRsaW5lV2lkdGhNb2RlOiBNVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZSA9IE1Ub29uTWF0ZXJpYWxPdXRsaW5lV2lkdGhNb2RlLk5vbmU7XG5cbiAgZ2V0IG91dGxpbmVXaWR0aE1vZGUoKTogTVRvb25NYXRlcmlhbE91dGxpbmVXaWR0aE1vZGUge1xuICAgIHJldHVybiB0aGlzLl9vdXRsaW5lV2lkdGhNb2RlO1xuICB9XG4gIHNldCBvdXRsaW5lV2lkdGhNb2RlKG06IE1Ub29uTWF0ZXJpYWxPdXRsaW5lV2lkdGhNb2RlKSB7XG4gICAgdGhpcy5fb3V0bGluZVdpZHRoTW9kZSA9IG07XG5cbiAgICB0aGlzLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2lzT3V0bGluZSA9IGZhbHNlO1xuXG4gIGdldCBpc091dGxpbmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzT3V0bGluZTtcbiAgfVxuICBzZXQgaXNPdXRsaW5lKGI6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9pc091dGxpbmUgPSBiO1xuXG4gICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVhZG9ubHkgYm9vbGVhbiB0aGF0IGluZGljYXRlcyB0aGlzIGlzIGEgW1tNVG9vbk1hdGVyaWFsXV0uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzTVRvb25NYXRlcmlhbCgpOiB0cnVlIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHBhcmFtZXRlcnM6IE1Ub29uTWF0ZXJpYWxQYXJhbWV0ZXJzID0ge30pIHtcbiAgICBzdXBlcih7IHZlcnRleFNoYWRlciwgZnJhZ21lbnRTaGFkZXIgfSk7XG5cbiAgICAvLyBvdmVycmlkZSBkZXB0aFdyaXRlIHdpdGggdHJhbnNwYXJlbnRXaXRoWldyaXRlXG4gICAgaWYgKHBhcmFtZXRlcnMudHJhbnNwYXJlbnRXaXRoWldyaXRlKSB7XG4gICAgICBwYXJhbWV0ZXJzLmRlcHRoV3JpdGUgPSB0cnVlO1xuICAgIH1cbiAgICBkZWxldGUgcGFyYW1ldGVycy50cmFuc3BhcmVudFdpdGhaV3JpdGU7XG5cbiAgICAvLyA9PSBlbmFibGluZyBidW5jaCBvZiBzdHVmZiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBwYXJhbWV0ZXJzLmZvZyA9IHRydWU7XG4gICAgcGFyYW1ldGVycy5saWdodHMgPSB0cnVlO1xuICAgIHBhcmFtZXRlcnMuY2xpcHBpbmcgPSB0cnVlO1xuXG4gICAgLy8gQ09NUEFUOiBwcmUtcjEyOVxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9wdWxsLzIxNzg4XG4gICAgaWYgKHBhcnNlSW50KFRIUkVFLlJFVklTSU9OLCAxMCkgPCAxMjkpIHtcbiAgICAgIChwYXJhbWV0ZXJzIGFzIGFueSkuc2tpbm5pbmcgPSAocGFyYW1ldGVycyBhcyBhbnkpLnNraW5uaW5nIHx8IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENPTVBBVDogcHJlLXIxMzFcbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvcHVsbC8yMjE2OVxuICAgIGlmIChwYXJzZUludChUSFJFRS5SRVZJU0lPTiwgMTApIDwgMTMxKSB7XG4gICAgICAocGFyYW1ldGVycyBhcyBhbnkpLm1vcnBoVGFyZ2V0cyA9IChwYXJhbWV0ZXJzIGFzIGFueSkubW9ycGhUYXJnZXRzIHx8IGZhbHNlO1xuICAgICAgKHBhcmFtZXRlcnMgYXMgYW55KS5tb3JwaE5vcm1hbHMgPSAocGFyYW1ldGVycyBhcyBhbnkpLm1vcnBoTm9ybWFscyB8fCBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyA9PSB1bmlmb3JtcyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB0aGlzLnVuaWZvcm1zID0gVEhSRUUuVW5pZm9ybXNVdGlscy5tZXJnZShbXG4gICAgICBUSFJFRS5Vbmlmb3Jtc0xpYi5jb21tb24sIC8vIG1hcFxuICAgICAgVEhSRUUuVW5pZm9ybXNMaWIubm9ybWFsbWFwLCAvLyBub3JtYWxNYXBcbiAgICAgIFRIUkVFLlVuaWZvcm1zTGliLmVtaXNzaXZlbWFwLCAvLyBlbWlzc2l2ZU1hcFxuICAgICAgVEhSRUUuVW5pZm9ybXNMaWIuZm9nLFxuICAgICAgVEhSRUUuVW5pZm9ybXNMaWIubGlnaHRzLFxuICAgICAge1xuICAgICAgICBsaXRGYWN0b3I6IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigxLjAsIDEuMCwgMS4wKSB9LFxuICAgICAgICBtYXBVdlRyYW5zZm9ybTogeyB2YWx1ZTogbmV3IFRIUkVFLk1hdHJpeDMoKSB9LFxuICAgICAgICBjb2xvckFscGhhOiB7IHZhbHVlOiAxLjAgfSxcbiAgICAgICAgbm9ybWFsTWFwVXZUcmFuc2Zvcm06IHsgdmFsdWU6IG5ldyBUSFJFRS5NYXRyaXgzKCkgfSxcbiAgICAgICAgc2hhZGVDb2xvckZhY3RvcjogeyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKDAuOTcsIDAuODEsIDAuODYpIH0sXG4gICAgICAgIHNoYWRlTXVsdGlwbHlUZXh0dXJlOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHNoYWRlTXVsdGlwbHlUZXh0dXJlVXZUcmFuc2Zvcm06IHsgdmFsdWU6IG5ldyBUSFJFRS5NYXRyaXgzKCkgfSxcbiAgICAgICAgc2hhZGluZ1NoaWZ0RmFjdG9yOiB7IHZhbHVlOiAwLjAgfSxcbiAgICAgICAgc2hhZGluZ1NoaWZ0VGV4dHVyZTogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICBzaGFkaW5nU2hpZnRUZXh0dXJlVXZUcmFuc2Zvcm06IHsgdmFsdWU6IG5ldyBUSFJFRS5NYXRyaXgzKCkgfSxcbiAgICAgICAgc2hhZGluZ1NoaWZ0VGV4dHVyZVNjYWxlOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHNoYWRpbmdUb29ueUZhY3RvcjogeyB2YWx1ZTogMC45IH0sXG4gICAgICAgIGdpRXF1YWxpemF0aW9uRmFjdG9yOiB7IHZhbHVlOiAwLjkgfSxcbiAgICAgICAgbWF0Y2FwRmFjdG9yOiB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoMC4wLCAwLjAsIDAuMCkgfSxcbiAgICAgICAgbWF0Y2FwVGV4dHVyZTogeyB2YWx1ZTogbnVsbCB9LFxuICAgICAgICBtYXRjYXBUZXh0dXJlVXZUcmFuc2Zvcm06IHsgdmFsdWU6IG5ldyBUSFJFRS5NYXRyaXgzKCkgfSxcbiAgICAgICAgcGFyYW1ldHJpY1JpbUNvbG9yRmFjdG9yOiB7IHZhbHVlOiBuZXcgVEhSRUUuQ29sb3IoMC4wLCAwLjAsIDAuMCkgfSxcbiAgICAgICAgcmltTXVsdGlwbHlUZXh0dXJlOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgIHJpbU11bHRpcGx5VGV4dHVyZVV2VHJhbnNmb3JtOiB7IHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4MygpIH0sXG4gICAgICAgIHJpbUxpZ2h0aW5nTWl4RmFjdG9yOiB7IHZhbHVlOiAwLjAgfSxcbiAgICAgICAgcGFyYW1ldHJpY1JpbUZyZXNuZWxQb3dlckZhY3RvcjogeyB2YWx1ZTogMS4wIH0sXG4gICAgICAgIHBhcmFtZXRyaWNSaW1MaWZ0RmFjdG9yOiB7IHZhbHVlOiAwLjAgfSxcbiAgICAgICAgZW1pc3NpdmU6IHsgdmFsdWU6IG5ldyBUSFJFRS5Db2xvcigwLjAsIDAuMCwgMC4wKSB9LFxuICAgICAgICBlbWlzc2l2ZUludGVuc2l0eTogeyB2YWx1ZTogMS4wIH0sXG4gICAgICAgIGVtaXNzaXZlTWFwVXZUcmFuc2Zvcm06IHsgdmFsdWU6IG5ldyBUSFJFRS5NYXRyaXgzKCkgfSxcbiAgICAgICAgb3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlOiB7IHZhbHVlOiBudWxsIH0sXG4gICAgICAgIG91dGxpbmVXaWR0aE11bHRpcGx5VGV4dHVyZVV2VHJhbnNmb3JtOiB7IHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4MygpIH0sXG4gICAgICAgIG91dGxpbmVXaWR0aEZhY3RvcjogeyB2YWx1ZTogMC41IH0sXG4gICAgICAgIG91dGxpbmVDb2xvckZhY3RvcjogeyB2YWx1ZTogbmV3IFRIUkVFLkNvbG9yKDAuMCwgMC4wLCAwLjApIH0sXG4gICAgICAgIG91dGxpbmVMaWdodGluZ01peEZhY3RvcjogeyB2YWx1ZTogMS4wIH0sXG4gICAgICAgIHV2QW5pbWF0aW9uTWFza1RleHR1cmU6IHsgdmFsdWU6IG51bGwgfSxcbiAgICAgICAgdXZBbmltYXRpb25NYXNrVGV4dHVyZVV2VHJhbnNmb3JtOiB7IHZhbHVlOiBuZXcgVEhSRUUuTWF0cml4MygpIH0sXG4gICAgICAgIHV2QW5pbWF0aW9uU2Nyb2xsWE9mZnNldDogeyB2YWx1ZTogMC4wIH0sXG4gICAgICAgIHV2QW5pbWF0aW9uU2Nyb2xsWU9mZnNldDogeyB2YWx1ZTogMC4wIH0sXG4gICAgICAgIHV2QW5pbWF0aW9uUm90YXRpb25QaGFzZTogeyB2YWx1ZTogMC4wIH0sXG4gICAgICB9LFxuICAgICAgcGFyYW1ldGVycy51bmlmb3JtcyxcbiAgICBdKTtcblxuICAgIC8vID09IGZpbmFsbHkgY29tcGlsZSB0aGUgc2hhZGVyIHByb2dyYW0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHRoaXMuc2V0VmFsdWVzKHBhcmFtZXRlcnMpO1xuXG4gICAgLy8gPT0gdXBsb2FkIHVuaWZvcm1zIHRoYXQgbmVlZCB0byB1cGxvYWQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5fdXBsb2FkVW5pZm9ybXNXb3JrYXJvdW5kKCk7XG5cbiAgICAvLyA9PSB1cGRhdGUgc2hhZGVyIHN0dWZmID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB0aGlzLmN1c3RvbVByb2dyYW1DYWNoZUtleSA9ICgpID0+XG4gICAgICBbXG4gICAgICAgIHRoaXMuX2lnbm9yZVZlcnRleENvbG9yID8gJ2lnbm9yZVZlcnRleENvbG9yJyA6ICcnLFxuICAgICAgICB0aGlzLl92MENvbXBhdFNoYWRlID8gJ3YwQ29tcGF0U2hhZGUnIDogJycsXG4gICAgICAgIHRoaXMuX2RlYnVnTW9kZSAhPT0gJ25vbmUnID8gYGRlYnVnTW9kZToke3RoaXMuX2RlYnVnTW9kZX1gIDogJycsXG4gICAgICAgIHRoaXMuX291dGxpbmVXaWR0aE1vZGUgIT09ICdub25lJyA/IGBvdXRsaW5lV2lkdGhNb2RlOiR7dGhpcy5fb3V0bGluZVdpZHRoTW9kZX1gIDogJycsXG4gICAgICAgIHRoaXMuX2lzT3V0bGluZSA/ICdpc091dGxpbmUnIDogJycsXG4gICAgICAgIC4uLk9iamVjdC5lbnRyaWVzKHRoaXMuX2dlbmVyYXRlRGVmaW5lcygpKS5tYXAoKFt0b2tlbiwgbWFjcm9dKSA9PiBgJHt0b2tlbn06JHttYWNyb31gKSxcbiAgICAgICAgdGhpcy5tYXRjYXBUZXh0dXJlID8gYG1hdGNhcFRleHR1cmVFbmNvZGluZzoke3RoaXMubWF0Y2FwVGV4dHVyZS5lbmNvZGluZ31gIDogJycsXG4gICAgICAgIHRoaXMuc2hhZGVNdWx0aXBseVRleHR1cmUgPyBgc2hhZGVNdWx0aXBseVRleHR1cmVFbmNvZGluZzoke3RoaXMuc2hhZGVNdWx0aXBseVRleHR1cmUuZW5jb2Rpbmd9YCA6ICcnLFxuICAgICAgICB0aGlzLnJpbU11bHRpcGx5VGV4dHVyZSA/IGByaW1NdWx0aXBseVRleHR1cmVFbmNvZGluZzoke3RoaXMucmltTXVsdGlwbHlUZXh0dXJlLmVuY29kaW5nfWAgOiAnJyxcbiAgICAgIF0uam9pbignLCcpO1xuXG4gICAgdGhpcy5vbkJlZm9yZUNvbXBpbGUgPSAoc2hhZGVyLCByZW5kZXJlcikgPT4ge1xuICAgICAgLyoqXG4gICAgICAgKiBXaWxsIGJlIG5lZWRlZCB0byBkZXRlcm1pbmUgd2hldGhlciB3ZSBzaG91bGQgaW5saW5lIGNvbnZlcnQgc1JHQiB0ZXh0dXJlcyBvciBub3QuXG4gICAgICAgKiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvcHVsbC8yMjU1MVxuICAgICAgICovXG4gICAgICBjb25zdCBpc1dlYkdMMiA9IHJlbmRlcmVyLmNhcGFiaWxpdGllcy5pc1dlYkdMMjtcblxuICAgICAgY29uc3QgdGhyZWVSZXZpc2lvbiA9IHBhcnNlSW50KFRIUkVFLlJFVklTSU9OLCAxMCk7XG5cbiAgICAgIGNvbnN0IGRlZmluZXMgPVxuICAgICAgICBPYmplY3QuZW50cmllcyh7IC4uLnRoaXMuX2dlbmVyYXRlRGVmaW5lcygpLCAuLi50aGlzLmRlZmluZXMgfSlcbiAgICAgICAgICAuZmlsdGVyKChbdG9rZW4sIG1hY3JvXSkgPT4gISFtYWNybylcbiAgICAgICAgICAubWFwKChbdG9rZW4sIG1hY3JvXSkgPT4gYCNkZWZpbmUgJHt0b2tlbn0gJHttYWNyb31gKVxuICAgICAgICAgIC5qb2luKCdcXG4nKSArICdcXG4nO1xuXG4gICAgICAvLyAtLSB0ZXh0dXJlIGVuY29kaW5ncyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBDT01QQVQ6IHByZS1yMTM3XG4gICAgICBsZXQgZW5jb2RpbmdzID0gJyc7XG5cbiAgICAgIGlmIChwYXJzZUludChUSFJFRS5SRVZJU0lPTiwgMTApIDwgMTM3KSB7XG4gICAgICAgIGVuY29kaW5ncyA9XG4gICAgICAgICAgKHRoaXMubWF0Y2FwVGV4dHVyZSAhPT0gbnVsbFxuICAgICAgICAgICAgPyBnZXRUZXhlbERlY29kaW5nRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgJ21hdGNhcFRleHR1cmVUZXhlbFRvTGluZWFyJyxcbiAgICAgICAgICAgICAgICBnZXRUZXh0dXJlRW5jb2RpbmdGcm9tTWFwKHRoaXMubWF0Y2FwVGV4dHVyZSwgaXNXZWJHTDIpLFxuICAgICAgICAgICAgICApICsgJ1xcbidcbiAgICAgICAgICAgIDogJycpICtcbiAgICAgICAgICAodGhpcy5zaGFkZU11bHRpcGx5VGV4dHVyZSAhPT0gbnVsbFxuICAgICAgICAgICAgPyBnZXRUZXhlbERlY29kaW5nRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgJ3NoYWRlTXVsdGlwbHlUZXh0dXJlVGV4ZWxUb0xpbmVhcicsXG4gICAgICAgICAgICAgICAgZ2V0VGV4dHVyZUVuY29kaW5nRnJvbU1hcCh0aGlzLnNoYWRlTXVsdGlwbHlUZXh0dXJlLCBpc1dlYkdMMiksXG4gICAgICAgICAgICAgICkgKyAnXFxuJ1xuICAgICAgICAgICAgOiAnJykgK1xuICAgICAgICAgICh0aGlzLnJpbU11bHRpcGx5VGV4dHVyZSAhPT0gbnVsbFxuICAgICAgICAgICAgPyBnZXRUZXhlbERlY29kaW5nRnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgJ3JpbU11bHRpcGx5VGV4dHVyZVRleGVsVG9MaW5lYXInLFxuICAgICAgICAgICAgICAgIGdldFRleHR1cmVFbmNvZGluZ0Zyb21NYXAodGhpcy5yaW1NdWx0aXBseVRleHR1cmUsIGlzV2ViR0wyKSxcbiAgICAgICAgICAgICAgKSArICdcXG4nXG4gICAgICAgICAgICA6ICcnKTtcbiAgICAgIH1cblxuICAgICAgLy8gLS0gZ2VuZXJhdGUgc2hhZGVyIGNvZGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgc2hhZGVyLnZlcnRleFNoYWRlciA9IGRlZmluZXMgKyBzaGFkZXIudmVydGV4U2hhZGVyO1xuICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gZGVmaW5lcyArIGVuY29kaW5ncyArIHNoYWRlci5mcmFnbWVudFNoYWRlcjtcblxuICAgICAgLy8gLS0gY29tcGF0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgICAvLyBDT01QQVQ6IHByZS1yMTMyXG4gICAgICAvLyBUaHJlZS5qcyByMTMyIGludHJvZHVjZXMgbmV3IHNoYWRlciBjaHVua3MgPG5vcm1hbF9wYXJzX2ZyYWdtZW50PiBhbmQgPGFscGhhdGVzdF9wYXJzX2ZyYWdtZW50PlxuICAgICAgaWYgKHRocmVlUmV2aXNpb24gPCAxMzIpIHtcbiAgICAgICAgc2hhZGVyLmZyYWdtZW50U2hhZGVyID0gc2hhZGVyLmZyYWdtZW50U2hhZGVyLnJlcGxhY2UoJyNpbmNsdWRlIDxub3JtYWxfcGFyc19mcmFnbWVudD4nLCAnJyk7XG4gICAgICAgIHNoYWRlci5mcmFnbWVudFNoYWRlciA9IHNoYWRlci5mcmFnbWVudFNoYWRlci5yZXBsYWNlKCcjaW5jbHVkZSA8YWxwaGF0ZXN0X3BhcnNfZnJhZ21lbnQ+JywgJycpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoaXMgbWF0ZXJpYWwuXG4gICAqXG4gICAqIEBwYXJhbSBkZWx0YSBkZWx0YVRpbWUgc2luY2UgbGFzdCB1cGRhdGVcbiAgICovXG4gIHB1YmxpYyB1cGRhdGUoZGVsdGE6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX3VwbG9hZFVuaWZvcm1zV29ya2Fyb3VuZCgpO1xuICAgIHRoaXMuX3VwZGF0ZVVWQW5pbWF0aW9uKGRlbHRhKTtcbiAgfVxuXG4gIHB1YmxpYyBjb3B5KHNvdXJjZTogdGhpcyk6IHRoaXMge1xuICAgIHN1cGVyLmNvcHkoc291cmNlKTtcbiAgICAvLyB1bmlmb3JtcyBhcmUgYWxyZWFkeSBjb3BpZWQgYXQgdGhpcyBtb21lbnRcblxuICAgIC8vIEJlZ2lubmluZyBmcm9tIHIxMzMsIHVuaWZvcm0gdGV4dHVyZXMgd2lsbCBiZSBjbG9uZWQgaW5zdGVhZCBvZiByZWZlcmVuY2VcbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9hODgxM2JlMDRhODQ5YmQxNTVmN2NmNmYxYjIzZDhlZTJlMGZiNDhiL2V4YW1wbGVzL2pzbS9sb2FkZXJzL0dMVEZMb2FkZXIuanMjTDMwNDdcbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9tcmRvb2IvdGhyZWUuanMvYmxvYi9hODgxM2JlMDRhODQ5YmQxNTVmN2NmNmYxYjIzZDhlZTJlMGZiNDhiL3NyYy9yZW5kZXJlcnMvc2hhZGVycy9Vbmlmb3Jtc1V0aWxzLmpzI0wyMlxuICAgIC8vIFRoaXMgd2lsbCBsZWF2ZSB0aGVpciBgLnZlcnNpb25gIHRvIGJlIGAwYFxuICAgIC8vIGFuZCB0aGVzZSB0ZXh0dXJlcyB3b24ndCBiZSB1cGxvYWRlZCB0byBHUFVcbiAgICAvLyBXZSBhcmUgZ29pbmcgdG8gd29ya2Fyb3VuZCB0aGlzIGluIGhlcmVcbiAgICAvLyBJJ3ZlIG9wZW5lZCBhbiBpc3N1ZSBmb3IgdGhpczogaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi90aHJlZS5qcy9pc3N1ZXMvMjI3MThcbiAgICB0aGlzLm1hcCA9IHNvdXJjZS5tYXA7XG4gICAgdGhpcy5ub3JtYWxNYXAgPSBzb3VyY2Uubm9ybWFsTWFwO1xuICAgIHRoaXMuZW1pc3NpdmVNYXAgPSBzb3VyY2UuZW1pc3NpdmVNYXA7XG4gICAgdGhpcy5zaGFkZU11bHRpcGx5VGV4dHVyZSA9IHNvdXJjZS5zaGFkZU11bHRpcGx5VGV4dHVyZTtcbiAgICB0aGlzLnNoYWRpbmdTaGlmdFRleHR1cmUgPSBzb3VyY2Uuc2hhZGluZ1NoaWZ0VGV4dHVyZTtcbiAgICB0aGlzLm1hdGNhcFRleHR1cmUgPSBzb3VyY2UubWF0Y2FwVGV4dHVyZTtcbiAgICB0aGlzLnJpbU11bHRpcGx5VGV4dHVyZSA9IHNvdXJjZS5yaW1NdWx0aXBseVRleHR1cmU7XG4gICAgdGhpcy5vdXRsaW5lV2lkdGhNdWx0aXBseVRleHR1cmUgPSBzb3VyY2Uub3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlO1xuICAgIHRoaXMudXZBbmltYXRpb25NYXNrVGV4dHVyZSA9IHNvdXJjZS51dkFuaW1hdGlvbk1hc2tUZXh0dXJlO1xuXG4gICAgLy8gPT0gY29weSBtZW1iZXJzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgdGhpcy5ub3JtYWxNYXBUeXBlID0gc291cmNlLm5vcm1hbE1hcFR5cGU7XG5cbiAgICB0aGlzLnV2QW5pbWF0aW9uU2Nyb2xsWFNwZWVkRmFjdG9yID0gc291cmNlLnV2QW5pbWF0aW9uU2Nyb2xsWFNwZWVkRmFjdG9yO1xuICAgIHRoaXMudXZBbmltYXRpb25TY3JvbGxZU3BlZWRGYWN0b3IgPSBzb3VyY2UudXZBbmltYXRpb25TY3JvbGxZU3BlZWRGYWN0b3I7XG4gICAgdGhpcy51dkFuaW1hdGlvblJvdGF0aW9uU3BlZWRGYWN0b3IgPSBzb3VyY2UudXZBbmltYXRpb25Sb3RhdGlvblNwZWVkRmFjdG9yO1xuXG4gICAgdGhpcy5pZ25vcmVWZXJ0ZXhDb2xvciA9IHNvdXJjZS5pZ25vcmVWZXJ0ZXhDb2xvcjtcblxuICAgIHRoaXMudjBDb21wYXRTaGFkZSA9IHNvdXJjZS52MENvbXBhdFNoYWRlO1xuICAgIHRoaXMuZGVidWdNb2RlID0gc291cmNlLmRlYnVnTW9kZTtcbiAgICB0aGlzLm91dGxpbmVXaWR0aE1vZGUgPSBzb3VyY2Uub3V0bGluZVdpZHRoTW9kZTtcblxuICAgIHRoaXMuaXNPdXRsaW5lID0gc291cmNlLmlzT3V0bGluZTtcblxuICAgIC8vID09IHVwZGF0ZSBzaGFkZXIgc3R1ZmYgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHRoaXMubmVlZHNVcGRhdGUgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIFVWIGFuaW1hdGlvbiBzdGF0ZS5cbiAgICogSW50ZW5kZWQgdG8gYmUgY2FsbGVkIHZpYSB7QGxpbmsgdXBkYXRlfS5cbiAgICogQHBhcmFtIGRlbHRhIGRlbHRhVGltZVxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlVVZBbmltYXRpb24oZGVsdGE6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudW5pZm9ybXMudXZBbmltYXRpb25TY3JvbGxYT2Zmc2V0LnZhbHVlICs9IGRlbHRhICogdGhpcy51dkFuaW1hdGlvblNjcm9sbFhTcGVlZEZhY3RvcjtcbiAgICB0aGlzLnVuaWZvcm1zLnV2QW5pbWF0aW9uU2Nyb2xsWU9mZnNldC52YWx1ZSArPSBkZWx0YSAqIHRoaXMudXZBbmltYXRpb25TY3JvbGxZU3BlZWRGYWN0b3I7XG4gICAgdGhpcy51bmlmb3Jtcy51dkFuaW1hdGlvblJvdGF0aW9uUGhhc2UudmFsdWUgKz0gZGVsdGEgKiB0aGlzLnV2QW5pbWF0aW9uUm90YXRpb25TcGVlZEZhY3RvcjtcblxuICAgIHRoaXMudW5pZm9ybXNOZWVkVXBkYXRlID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGxvYWQgdW5pZm9ybXMgdGhhdCBuZWVkIHRvIHVwbG9hZCBidXQgZG9lc24ndCBhdXRvbWF0aWNhbGx5IGJlY2F1c2Ugb2YgcmVhc29ucy5cbiAgICogSW50ZW5kZWQgdG8gYmUgY2FsbGVkIHZpYSB7QGxpbmsgY29uc3RydWN0b3J9IGFuZCB7QGxpbmsgdXBkYXRlfS5cbiAgICovXG4gIHByaXZhdGUgX3VwbG9hZFVuaWZvcm1zV29ya2Fyb3VuZCgpOiB2b2lkIHtcbiAgICAvLyB3b3JrYXJvdW5kOiBzaW5jZSBvcGFjaXR5IGlzIGRlZmluZWQgYXMgYSBwcm9wZXJ0eSBpbiBUSFJFRS5NYXRlcmlhbFxuICAgIC8vIGFuZCBjYW5ub3QgYmUgb3ZlcnJpZGRlbiBhcyBhbiBhY2Nlc3NvcixcbiAgICAvLyBXZSBhcmUgZ29pbmcgdG8gdXBkYXRlIG9wYWNpdHkgaGVyZVxuICAgIHRoaXMudW5pZm9ybXMub3BhY2l0eS52YWx1ZSA9IHRoaXMub3BhY2l0eTtcblxuICAgIC8vIHdvcmthcm91bmQ6IHRleHR1cmUgdHJhbnNmb3JtcyBhcmUgbm90IHVwZGF0ZWQgYXV0b21hdGljYWxseVxuICAgIHRoaXMuX3VwZGF0ZVRleHR1cmVNYXRyaXgodGhpcy51bmlmb3Jtcy5tYXAsIHRoaXMudW5pZm9ybXMubWFwVXZUcmFuc2Zvcm0pO1xuICAgIHRoaXMuX3VwZGF0ZVRleHR1cmVNYXRyaXgodGhpcy51bmlmb3Jtcy5ub3JtYWxNYXAsIHRoaXMudW5pZm9ybXMubm9ybWFsTWFwVXZUcmFuc2Zvcm0pO1xuICAgIHRoaXMuX3VwZGF0ZVRleHR1cmVNYXRyaXgodGhpcy51bmlmb3Jtcy5lbWlzc2l2ZU1hcCwgdGhpcy51bmlmb3Jtcy5lbWlzc2l2ZU1hcFV2VHJhbnNmb3JtKTtcbiAgICB0aGlzLl91cGRhdGVUZXh0dXJlTWF0cml4KHRoaXMudW5pZm9ybXMuc2hhZGVNdWx0aXBseVRleHR1cmUsIHRoaXMudW5pZm9ybXMuc2hhZGVNdWx0aXBseVRleHR1cmVVdlRyYW5zZm9ybSk7XG4gICAgdGhpcy5fdXBkYXRlVGV4dHVyZU1hdHJpeCh0aGlzLnVuaWZvcm1zLnNoYWRpbmdTaGlmdFRleHR1cmUsIHRoaXMudW5pZm9ybXMuc2hhZGluZ1NoaWZ0VGV4dHVyZVV2VHJhbnNmb3JtKTtcbiAgICB0aGlzLl91cGRhdGVUZXh0dXJlTWF0cml4KHRoaXMudW5pZm9ybXMubWF0Y2FwVGV4dHVyZSwgdGhpcy51bmlmb3Jtcy5tYXRjYXBUZXh0dXJlVXZUcmFuc2Zvcm0pO1xuICAgIHRoaXMuX3VwZGF0ZVRleHR1cmVNYXRyaXgodGhpcy51bmlmb3Jtcy5yaW1NdWx0aXBseVRleHR1cmUsIHRoaXMudW5pZm9ybXMucmltTXVsdGlwbHlUZXh0dXJlVXZUcmFuc2Zvcm0pO1xuICAgIHRoaXMuX3VwZGF0ZVRleHR1cmVNYXRyaXgoXG4gICAgICB0aGlzLnVuaWZvcm1zLm91dGxpbmVXaWR0aE11bHRpcGx5VGV4dHVyZSxcbiAgICAgIHRoaXMudW5pZm9ybXMub3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlVXZUcmFuc2Zvcm0sXG4gICAgKTtcbiAgICB0aGlzLl91cGRhdGVUZXh0dXJlTWF0cml4KHRoaXMudW5pZm9ybXMudXZBbmltYXRpb25NYXNrVGV4dHVyZSwgdGhpcy51bmlmb3Jtcy51dkFuaW1hdGlvbk1hc2tUZXh0dXJlVXZUcmFuc2Zvcm0pO1xuXG4gICAgLy8gQ09NUEFUIHdvcmthcm91bmQ6IHN0YXJ0aW5nIGZyb20gcjEzMiwgYWxwaGFUZXN0IGJlY29tZXMgYSB1bmlmb3JtIGluc3RlYWQgb2YgcHJlcHJvY2Vzc29yIHZhbHVlXG4gICAgY29uc3QgdGhyZWVSZXZpc2lvbiA9IHBhcnNlSW50KFRIUkVFLlJFVklTSU9OLCAxMCk7XG5cbiAgICBpZiAodGhyZWVSZXZpc2lvbiA+PSAxMzIpIHtcbiAgICAgIHRoaXMudW5pZm9ybXMuYWxwaGFUZXN0LnZhbHVlID0gdGhpcy5hbHBoYVRlc3Q7XG4gICAgfVxuXG4gICAgdGhpcy51bmlmb3Jtc05lZWRVcGRhdGUgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBtYXAgb2JqZWN0IG9mIHByZXByb2Nlc3NvciB0b2tlbiBhbmQgbWFjcm8gb2YgdGhlIHNoYWRlciBwcm9ncmFtLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2VuZXJhdGVEZWZpbmVzKCk6IHsgW3Rva2VuOiBzdHJpbmddOiBib29sZWFuIHwgbnVtYmVyIHwgc3RyaW5nIH0ge1xuICAgIGNvbnN0IHRocmVlUmV2aXNpb24gPSBwYXJzZUludChUSFJFRS5SRVZJU0lPTiwgMTApO1xuXG4gICAgY29uc3QgdXNlVXZJblZlcnQgPSB0aGlzLm91dGxpbmVXaWR0aE11bHRpcGx5VGV4dHVyZSAhPT0gbnVsbDtcbiAgICBjb25zdCB1c2VVdkluRnJhZyA9XG4gICAgICB0aGlzLm1hcCAhPT0gbnVsbCB8fFxuICAgICAgdGhpcy5lbWlzc2l2ZU1hcCAhPT0gbnVsbCB8fFxuICAgICAgdGhpcy5zaGFkZU11bHRpcGx5VGV4dHVyZSAhPT0gbnVsbCB8fFxuICAgICAgdGhpcy5zaGFkaW5nU2hpZnRUZXh0dXJlICE9PSBudWxsIHx8XG4gICAgICB0aGlzLnJpbU11bHRpcGx5VGV4dHVyZSAhPT0gbnVsbCB8fFxuICAgICAgdGhpcy51dkFuaW1hdGlvbk1hc2tUZXh0dXJlICE9PSBudWxsO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIFRlbXBvcmFyeSBjb21wYXQgYWdhaW5zdCBzaGFkZXIgY2hhbmdlIEAgVGhyZWUuanMgcjEyNlxuICAgICAgLy8gU2VlOiAjMjEyMDUsICMyMTMwNywgIzIxMjk5XG4gICAgICBUSFJFRV9WUk1fVEhSRUVfUkVWSVNJT046IHRocmVlUmV2aXNpb24sXG5cbiAgICAgIE9VVExJTkU6IHRoaXMuX2lzT3V0bGluZSxcbiAgICAgIE1UT09OX1VTRV9VVjogdXNlVXZJblZlcnQgfHwgdXNlVXZJbkZyYWcsIC8vIHdlIGNhbid0IHVzZSBgVVNFX1VWYCAsIGl0IHdpbGwgYmUgcmVkZWZpbmVkIGluIFdlYkdMUHJvZ3JhbS5qc1xuICAgICAgTVRPT05fVVZTX1ZFUlRFWF9PTkxZOiB1c2VVdkluVmVydCAmJiAhdXNlVXZJbkZyYWcsXG4gICAgICBWMF9DT01QQVRfU0hBREU6IHRoaXMuX3YwQ29tcGF0U2hhZGUsXG4gICAgICBVU0VfU0hBREVNVUxUSVBMWVRFWFRVUkU6IHRoaXMuc2hhZGVNdWx0aXBseVRleHR1cmUgIT09IG51bGwsXG4gICAgICBVU0VfU0hBRElOR1NISUZUVEVYVFVSRTogdGhpcy5zaGFkaW5nU2hpZnRUZXh0dXJlICE9PSBudWxsLFxuICAgICAgVVNFX01BVENBUFRFWFRVUkU6IHRoaXMubWF0Y2FwVGV4dHVyZSAhPT0gbnVsbCxcbiAgICAgIFVTRV9SSU1NVUxUSVBMWVRFWFRVUkU6IHRoaXMucmltTXVsdGlwbHlUZXh0dXJlICE9PSBudWxsLFxuICAgICAgVVNFX09VVExJTkVXSURUSE1VTFRJUExZVEVYVFVSRTogdGhpcy5vdXRsaW5lV2lkdGhNdWx0aXBseVRleHR1cmUgIT09IG51bGwsXG4gICAgICBVU0VfVVZBTklNQVRJT05NQVNLVEVYVFVSRTogdGhpcy51dkFuaW1hdGlvbk1hc2tUZXh0dXJlICE9PSBudWxsLFxuICAgICAgSUdOT1JFX1ZFUlRFWF9DT0xPUjogdGhpcy5faWdub3JlVmVydGV4Q29sb3IgPT09IHRydWUsXG4gICAgICBERUJVR19OT1JNQUw6IHRoaXMuX2RlYnVnTW9kZSA9PT0gJ25vcm1hbCcsXG4gICAgICBERUJVR19MSVRTSEFERVJBVEU6IHRoaXMuX2RlYnVnTW9kZSA9PT0gJ2xpdFNoYWRlUmF0ZScsXG4gICAgICBERUJVR19VVjogdGhpcy5fZGVidWdNb2RlID09PSAndXYnLFxuICAgICAgT1VUTElORV9XSURUSF9XT1JMRDogdGhpcy5fb3V0bGluZVdpZHRoTW9kZSA9PT0gTVRvb25NYXRlcmlhbE91dGxpbmVXaWR0aE1vZGUuV29ybGRDb29yZGluYXRlcyxcbiAgICAgIE9VVExJTkVfV0lEVEhfU0NSRUVOOiB0aGlzLl9vdXRsaW5lV2lkdGhNb2RlID09PSBNVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZS5TY3JlZW5Db29yZGluYXRlcyxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVGV4dHVyZU1hdHJpeChzcmM6IFRIUkVFLklVbmlmb3JtPFRIUkVFLlRleHR1cmUgfCBudWxsPiwgZHN0OiBUSFJFRS5JVW5pZm9ybTxUSFJFRS5NYXRyaXgzPik6IHZvaWQge1xuICAgIGlmIChzcmMudmFsdWUpIHtcbiAgICAgIGlmIChzcmMudmFsdWUubWF0cml4QXV0b1VwZGF0ZSkge1xuICAgICAgICBzcmMudmFsdWUudXBkYXRlTWF0cml4KCk7XG4gICAgICB9XG5cbiAgICAgIGRzdC52YWx1ZS5jb3B5KHNyYy52YWx1ZS5tYXRyaXgpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuaW1wb3J0IHsgR0xURlBhcnNlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL0dMVEZMb2FkZXIuanMnO1xuaW1wb3J0IHsgTVRvb25NYXRlcmlhbFBhcmFtZXRlcnMgfSBmcm9tICcuL01Ub29uTWF0ZXJpYWxQYXJhbWV0ZXJzJztcblxuLyoqXG4gKiBNYXRlcmlhbFBhcmFtZXRlcnMgaGF0ZXMgYHVuZGVmaW5lZGAuIFRoaXMgaGVscGVyIGF1dG9tYXRpY2FsbHkgcmVqZWN0cyBhc3NpZ24gb2YgdGhlc2UgYHVuZGVmaW5lZGAuXG4gKiBJdCBhbHNvIGhhbmRsZXMgYXN5bmNocm9ub3VzIHByb2Nlc3Mgb2YgdGV4dHVyZXMuXG4gKiBNYWtlIHN1cmUgYXdhaXQgZm9yIHtAbGluayBHTFRGTVRvb25NYXRlcmlhbFBhcmFtc0Fzc2lnbkhlbHBlci5wZW5kaW5nfS5cbiAqL1xuZXhwb3J0IGNsYXNzIEdMVEZNVG9vbk1hdGVyaWFsUGFyYW1zQXNzaWduSGVscGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBfcGFyc2VyOiBHTFRGUGFyc2VyO1xuICBwcml2YXRlIF9tYXRlcmlhbFBhcmFtczogTVRvb25NYXRlcmlhbFBhcmFtZXRlcnM7XG4gIHByaXZhdGUgX3BlbmRpbmdzOiBQcm9taXNlPGFueT5bXTtcblxuICBwdWJsaWMgZ2V0IHBlbmRpbmcoKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMuX3BlbmRpbmdzKTtcbiAgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXJzZXI6IEdMVEZQYXJzZXIsIG1hdGVyaWFsUGFyYW1zOiBNVG9vbk1hdGVyaWFsUGFyYW1ldGVycykge1xuICAgIHRoaXMuX3BhcnNlciA9IHBhcnNlcjtcbiAgICB0aGlzLl9tYXRlcmlhbFBhcmFtcyA9IG1hdGVyaWFsUGFyYW1zO1xuICAgIHRoaXMuX3BlbmRpbmdzID0gW107XG4gIH1cblxuICBwdWJsaWMgYXNzaWduUHJpbWl0aXZlPFQgZXh0ZW5kcyBrZXlvZiBNVG9vbk1hdGVyaWFsUGFyYW1ldGVycz4oa2V5OiBULCB2YWx1ZTogTVRvb25NYXRlcmlhbFBhcmFtZXRlcnNbVF0pOiB2b2lkIHtcbiAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWF0ZXJpYWxQYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3NpZ25Db2xvcjxUIGV4dGVuZHMga2V5b2YgTVRvb25NYXRlcmlhbFBhcmFtZXRlcnM+KFxuICAgIGtleTogVCxcbiAgICB2YWx1ZTogbnVtYmVyW10gfCB1bmRlZmluZWQsXG4gICAgY29udmVydFNSR0JUb0xpbmVhcj86IGJvb2xlYW4sXG4gICk6IHZvaWQge1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tYXRlcmlhbFBhcmFtc1trZXldID0gbmV3IFRIUkVFLkNvbG9yKCkuZnJvbUFycmF5KHZhbHVlKTtcblxuICAgICAgaWYgKGNvbnZlcnRTUkdCVG9MaW5lYXIpIHtcbiAgICAgICAgdGhpcy5fbWF0ZXJpYWxQYXJhbXNba2V5XS5jb252ZXJ0U1JHQlRvTGluZWFyKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzc2lnblRleHR1cmU8VCBleHRlbmRzIGtleW9mIE1Ub29uTWF0ZXJpYWxQYXJhbWV0ZXJzPihcbiAgICBrZXk6IFQsXG4gICAgdGV4dHVyZTogeyBpbmRleDogbnVtYmVyIH0gfCB1bmRlZmluZWQsXG4gICAgaXNDb2xvclRleHR1cmU6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKHRleHR1cmUgIT0gbnVsbCkge1xuICAgICAgICBhd2FpdCB0aGlzLl9wYXJzZXIuYXNzaWduVGV4dHVyZSh0aGlzLl9tYXRlcmlhbFBhcmFtcywga2V5LCB0ZXh0dXJlKTtcblxuICAgICAgICBpZiAoaXNDb2xvclRleHR1cmUpIHtcbiAgICAgICAgICB0aGlzLl9tYXRlcmlhbFBhcmFtc1trZXldLmVuY29kaW5nID0gVEhSRUUuc1JHQkVuY29kaW5nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkoKTtcblxuICAgIHRoaXMuX3BlbmRpbmdzLnB1c2gocHJvbWlzZSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3NpZ25UZXh0dXJlQnlJbmRleDxUIGV4dGVuZHMga2V5b2YgTVRvb25NYXRlcmlhbFBhcmFtZXRlcnM+KFxuICAgIGtleTogVCxcbiAgICB0ZXh0dXJlSW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCxcbiAgICBpc0NvbG9yVGV4dHVyZTogYm9vbGVhbixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuYXNzaWduVGV4dHVyZShrZXksIHRleHR1cmVJbmRleCAhPSBudWxsID8geyBpbmRleDogdGV4dHVyZUluZGV4IH0gOiB1bmRlZmluZWQsIGlzQ29sb3JUZXh0dXJlKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgVEhSRUUgZnJvbSAndGhyZWUnO1xuaW1wb3J0ICogYXMgVjFNVG9vblNjaGVtYSBmcm9tICdAcGl4aXYvdHlwZXMtdnJtYy1tYXRlcmlhbHMtbXRvb24tMS4wJztcbmltcG9ydCB0eXBlIHsgR0xURiwgR0xURkxvYWRlclBsdWdpbiwgR0xURlBhcnNlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL0dMVEZMb2FkZXIuanMnO1xuaW1wb3J0IHsgTVRvb25NYXRlcmlhbCB9IGZyb20gJy4vTVRvb25NYXRlcmlhbCc7XG5pbXBvcnQgdHlwZSB7IE1Ub29uTWF0ZXJpYWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9NVG9vbk1hdGVyaWFsUGFyYW1ldGVycyc7XG5pbXBvcnQgeyBNVG9vbk1hdGVyaWFsT3V0bGluZVdpZHRoTW9kZSB9IGZyb20gJy4vTVRvb25NYXRlcmlhbE91dGxpbmVXaWR0aE1vZGUnO1xuaW1wb3J0IHsgR0xURk1Ub29uTWF0ZXJpYWxQYXJhbXNBc3NpZ25IZWxwZXIgfSBmcm9tICcuL0dMVEZNVG9vbk1hdGVyaWFsUGFyYW1zQXNzaWduSGVscGVyJztcbmltcG9ydCB7IE1Ub29uTWF0ZXJpYWxMb2FkZXJQbHVnaW5PcHRpb25zIH0gZnJvbSAnLi9NVG9vbk1hdGVyaWFsTG9hZGVyUGx1Z2luT3B0aW9ucyc7XG5pbXBvcnQgdHlwZSB7IE1Ub29uTWF0ZXJpYWxEZWJ1Z01vZGUgfSBmcm9tICcuL01Ub29uTWF0ZXJpYWxEZWJ1Z01vZGUnO1xuaW1wb3J0IHsgR0xURiBhcyBHTFRGU2NoZW1hIH0gZnJvbSAnQGdsdGYtdHJhbnNmb3JtL2NvcmUnO1xuXG4vKipcbiAqIFBvc3NpYmxlIHNwZWMgdmVyc2lvbnMgaXQgcmVjb2duaXplcy5cbiAqL1xuY29uc3QgUE9TU0lCTEVfU1BFQ19WRVJTSU9OUyA9IG5ldyBTZXQoWycxLjAnLCAnMS4wLWJldGEnXSk7XG5cbmV4cG9ydCBjbGFzcyBNVG9vbk1hdGVyaWFsTG9hZGVyUGx1Z2luIGltcGxlbWVudHMgR0xURkxvYWRlclBsdWdpbiB7XG4gIHB1YmxpYyBzdGF0aWMgRVhURU5TSU9OX05BTUUgPSAnVlJNQ19tYXRlcmlhbHNfbXRvb24nO1xuXG4gIC8qKlxuICAgKiBUaGlzIHZhbHVlIHdpbGwgYmUgYWRkZWQgdG8gYHJlbmRlck9yZGVyYCBvZiBldmVyeSBtZXNoZXMgd2hvIGhhdmUgTWF0ZXJpYWxzTVRvb24uXG4gICAqIFRoZSBmaW5hbCByZW5kZXJPcmRlciB3aWxsIGJlIHN1bSBvZiB0aGlzIGByZW5kZXJPcmRlck9mZnNldGAgYW5kIGByZW5kZXJRdWV1ZU9mZnNldE51bWJlcmAgZm9yIGVhY2ggbWF0ZXJpYWxzLlxuICAgKiBgMGAgYnkgZGVmYXVsdC5cbiAgICovXG4gIHB1YmxpYyByZW5kZXJPcmRlck9mZnNldDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaGVyZSBpcyBhIGxpbmUgb2YgdGhlIHNoYWRlciBjYWxsZWQgXCJjb21tZW50IG91dCBpZiB5b3Ugd2FudCB0byBQQlIgYWJzb2x1dGVseVwiIGluIFZSTTAuMCBNVG9vbi5cbiAgICogV2hlbiB0aGlzIGlzIHRydWUsIHRoZSBtYXRlcmlhbCBlbmFibGVzIHRoZSBsaW5lIHRvIG1ha2UgaXQgY29tcGF0aWJsZSB3aXRoIHRoZSBsZWdhY3kgcmVuZGVyaW5nIG9mIFZSTS5cbiAgICogVXN1YWxseSBub3QgcmVjb21tZW5kZWQgdG8gdHVybiB0aGlzIG9uLlxuICAgKiBgZmFsc2VgIGJ5IGRlZmF1bHQuXG4gICAqL1xuICBwdWJsaWMgdjBDb21wYXRTaGFkZTogYm9vbGVhbjtcblxuICAvKipcbiAgICogRGVidWcgbW9kZSBmb3IgdGhlIG1hdGVyaWFsLlxuICAgKiBZb3UgY2FuIHZpc3VhbGl6ZSBzZXZlcmFsIGNvbXBvbmVudHMgZm9yIGRpYWdub3NpcyB1c2luZyBkZWJ1ZyBtb2RlLlxuICAgKlxuICAgKiBTZWU6IHtAbGluayBNVG9vbk1hdGVyaWFsRGVidWdNb2RlfVxuICAgKi9cbiAgcHVibGljIGRlYnVnTW9kZTogTVRvb25NYXRlcmlhbERlYnVnTW9kZTtcblxuICBwdWJsaWMgcmVhZG9ubHkgcGFyc2VyOiBHTFRGUGFyc2VyO1xuXG4gIC8qKlxuICAgKiBMb2FkZWQgbWF0ZXJpYWxzIHdpbGwgYmUgc3RvcmVkIGluIHRoaXMgc2V0LlxuICAgKiBXaWxsIGJlIHRyYW5zZmVycmVkIGludG8gYGdsdGYudXNlckRhdGEudnJtTVRvb25NYXRlcmlhbHNgIGluIHtAbGluayBhZnRlclJvb3R9LlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfbVRvb25NYXRlcmlhbFNldDogU2V0PE1Ub29uTWF0ZXJpYWw+O1xuXG4gIHB1YmxpYyBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBNVG9vbk1hdGVyaWFsTG9hZGVyUGx1Z2luLkVYVEVOU0lPTl9OQU1FO1xuICB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHBhcnNlcjogR0xURlBhcnNlciwgb3B0aW9uczogTVRvb25NYXRlcmlhbExvYWRlclBsdWdpbk9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMucGFyc2VyID0gcGFyc2VyO1xuXG4gICAgdGhpcy5yZW5kZXJPcmRlck9mZnNldCA9IG9wdGlvbnMucmVuZGVyT3JkZXJPZmZzZXQgPz8gMDtcbiAgICB0aGlzLnYwQ29tcGF0U2hhZGUgPSBvcHRpb25zLnYwQ29tcGF0U2hhZGUgPz8gZmFsc2U7XG4gICAgdGhpcy5kZWJ1Z01vZGUgPSBvcHRpb25zLmRlYnVnTW9kZSA/PyAnbm9uZSc7XG5cbiAgICB0aGlzLl9tVG9vbk1hdGVyaWFsU2V0ID0gbmV3IFNldCgpO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZm9yZVJvb3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fcmVtb3ZlVW5saXRFeHRlbnNpb25JZk1Ub29uRXhpc3RzKCk7XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYWZ0ZXJSb290KGdsdGY6IEdMVEYpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBnbHRmLnVzZXJEYXRhLnZybU1Ub29uTWF0ZXJpYWxzID0gQXJyYXkuZnJvbSh0aGlzLl9tVG9vbk1hdGVyaWFsU2V0KTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRNYXRlcmlhbFR5cGUobWF0ZXJpYWxJbmRleDogbnVtYmVyKTogdHlwZW9mIFRIUkVFLk1hdGVyaWFsIHwgbnVsbCB7XG4gICAgY29uc3QgdjFFeHRlbnNpb24gPSB0aGlzLl9nZXRNVG9vbkV4dGVuc2lvbihtYXRlcmlhbEluZGV4KTtcbiAgICBpZiAodjFFeHRlbnNpb24pIHtcbiAgICAgIHJldHVybiBNVG9vbk1hdGVyaWFsO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHVibGljIGV4dGVuZE1hdGVyaWFsUGFyYW1zKG1hdGVyaWFsSW5kZXg6IG51bWJlciwgbWF0ZXJpYWxQYXJhbXM6IE1Ub29uTWF0ZXJpYWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxhbnk+IHwgbnVsbCB7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5fZ2V0TVRvb25FeHRlbnNpb24obWF0ZXJpYWxJbmRleCk7XG4gICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4dGVuZE1hdGVyaWFsUGFyYW1zKGV4dGVuc2lvbiwgbWF0ZXJpYWxQYXJhbXMpO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWRNZXNoKG1lc2hJbmRleDogbnVtYmVyKTogUHJvbWlzZTxUSFJFRS5Hcm91cCB8IFRIUkVFLk1lc2ggfCBUSFJFRS5Ta2lubmVkTWVzaD4ge1xuICAgIGNvbnN0IHBhcnNlciA9IHRoaXMucGFyc2VyO1xuICAgIGNvbnN0IGpzb24gPSBwYXJzZXIuanNvbiBhcyBHTFRGU2NoZW1hLklHTFRGO1xuXG4gICAgY29uc3QgbWVzaERlZiA9IGpzb24ubWVzaGVzPy5bbWVzaEluZGV4XTtcblxuICAgIGlmIChtZXNoRGVmID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1Ub29uTWF0ZXJpYWxMb2FkZXJQbHVnaW46IEF0dGVtcHQgdG8gdXNlIG1lc2hlc1ske21lc2hJbmRleH1dIG9mIGdsVEYgYnV0IHRoZSBtZXNoIGRvZXNuJ3QgZXhpc3RgLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmltaXRpdmVzRGVmID0gbWVzaERlZi5wcmltaXRpdmVzO1xuXG4gICAgY29uc3QgbWVzaE9yR3JvdXAgPSBhd2FpdCBwYXJzZXIubG9hZE1lc2gobWVzaEluZGV4KTtcblxuICAgIGlmIChwcmltaXRpdmVzRGVmLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY29uc3QgbWVzaCA9IG1lc2hPckdyb3VwIGFzIFRIUkVFLk1lc2g7XG4gICAgICBjb25zdCBtYXRlcmlhbEluZGV4ID0gcHJpbWl0aXZlc0RlZlswXS5tYXRlcmlhbDtcblxuICAgICAgaWYgKG1hdGVyaWFsSW5kZXggIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9zZXR1cFByaW1pdGl2ZShtZXNoLCBtYXRlcmlhbEluZGV4KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZ3JvdXAgPSBtZXNoT3JHcm91cCBhcyBUSFJFRS5Hcm91cDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJpbWl0aXZlc0RlZi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBtZXNoID0gZ3JvdXAuY2hpbGRyZW5baV0gYXMgVEhSRUUuTWVzaDtcbiAgICAgICAgY29uc3QgbWF0ZXJpYWxJbmRleCA9IHByaW1pdGl2ZXNEZWZbaV0ubWF0ZXJpYWw7XG5cbiAgICAgICAgaWYgKG1hdGVyaWFsSW5kZXggIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX3NldHVwUHJpbWl0aXZlKG1lc2gsIG1hdGVyaWFsSW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lc2hPckdyb3VwO1xuICB9XG5cbiAgLyoqXG4gICAqIERlbGV0ZSB1c2Ugb2YgYEtIUl9tYXRlcmlhbHNfdW5saXRgIGZyb20gaXRzIGBtYXRlcmlhbHNgIGlmIHRoZSBtYXRlcmlhbCBpcyB1c2luZyBNVG9vbi5cbiAgICpcbiAgICogU2luY2UgR0xURkxvYWRlciBoYXZlIHNvIG1hbnkgaGFyZGNvZGVkIHByb2NlZHVyZSByZWxhdGVkIHRvIGBLSFJfbWF0ZXJpYWxzX3VubGl0YFxuICAgKiB3ZSBoYXZlIHRvIGRlbGV0ZSB0aGUgZXh0ZW5zaW9uIGJlZm9yZSB3ZSBzdGFydCB0byBwYXJzZSB0aGUgZ2xURi5cbiAgICovXG4gIHByaXZhdGUgX3JlbW92ZVVubGl0RXh0ZW5zaW9uSWZNVG9vbkV4aXN0cygpOiB2b2lkIHtcbiAgICBjb25zdCBwYXJzZXIgPSB0aGlzLnBhcnNlcjtcbiAgICBjb25zdCBqc29uID0gcGFyc2VyLmpzb24gYXMgR0xURlNjaGVtYS5JR0xURjtcblxuICAgIGNvbnN0IG1hdGVyaWFsRGVmcyA9IGpzb24ubWF0ZXJpYWxzO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBtYXRlcmlhbERlZnM/Lm1hcCgobWF0ZXJpYWxEZWYsIGlNYXRlcmlhbCkgPT4ge1xuICAgICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5fZ2V0TVRvb25FeHRlbnNpb24oaU1hdGVyaWFsKTtcblxuICAgICAgaWYgKGV4dGVuc2lvbiAmJiBtYXRlcmlhbERlZi5leHRlbnNpb25zPy5bJ0tIUl9tYXRlcmlhbHNfdW5saXQnXSkge1xuICAgICAgICBkZWxldGUgbWF0ZXJpYWxEZWYuZXh0ZW5zaW9uc1snS0hSX21hdGVyaWFsc191bmxpdCddO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TVRvb25FeHRlbnNpb24obWF0ZXJpYWxJbmRleDogbnVtYmVyKTogVjFNVG9vblNjaGVtYS5WUk1DTWF0ZXJpYWxzTVRvb24gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IHBhcnNlciA9IHRoaXMucGFyc2VyO1xuICAgIGNvbnN0IGpzb24gPSBwYXJzZXIuanNvbiBhcyBHTFRGU2NoZW1hLklHTFRGO1xuXG4gICAgY29uc3QgbWF0ZXJpYWxEZWYgPSBqc29uLm1hdGVyaWFscz8uW21hdGVyaWFsSW5kZXhdO1xuXG4gICAgaWYgKG1hdGVyaWFsRGVmID09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgYE1Ub29uTWF0ZXJpYWxMb2FkZXJQbHVnaW46IEF0dGVtcHQgdG8gdXNlIG1hdGVyaWFsc1ske21hdGVyaWFsSW5kZXh9XSBvZiBnbFRGIGJ1dCB0aGUgbWF0ZXJpYWwgZG9lc24ndCBleGlzdGAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBleHRlbnNpb24gPSBtYXRlcmlhbERlZi5leHRlbnNpb25zPy5bTVRvb25NYXRlcmlhbExvYWRlclBsdWdpbi5FWFRFTlNJT05fTkFNRV0gYXNcbiAgICAgIHwgVjFNVG9vblNjaGVtYS5WUk1DTWF0ZXJpYWxzTVRvb25cbiAgICAgIHwgdW5kZWZpbmVkO1xuICAgIGlmIChleHRlbnNpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBzcGVjVmVyc2lvbiA9IGV4dGVuc2lvbi5zcGVjVmVyc2lvbjtcbiAgICBpZiAoIVBPU1NJQkxFX1NQRUNfVkVSU0lPTlMuaGFzKHNwZWNWZXJzaW9uKSkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBgTVRvb25NYXRlcmlhbExvYWRlclBsdWdpbjogVW5rbm93biAke01Ub29uTWF0ZXJpYWxMb2FkZXJQbHVnaW4uRVhURU5TSU9OX05BTUV9IHNwZWNWZXJzaW9uIFwiJHtzcGVjVmVyc2lvbn1cImAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZXh0ZW5zaW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfZXh0ZW5kTWF0ZXJpYWxQYXJhbXMoXG4gICAgZXh0ZW5zaW9uOiBWMU1Ub29uU2NoZW1hLlZSTUNNYXRlcmlhbHNNVG9vbixcbiAgICBtYXRlcmlhbFBhcmFtczogTVRvb25NYXRlcmlhbFBhcmFtZXRlcnMsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFJlbW92aW5nIG1hdGVyaWFsIHBhcmFtcyB0aGF0IGlzIG5vdCByZXF1aXJlZCB0byBzdXByZXNzIHdhcm5pbmdzLlxuICAgIGRlbGV0ZSAobWF0ZXJpYWxQYXJhbXMgYXMgVEhSRUUuTWVzaFN0YW5kYXJkTWF0ZXJpYWxQYXJhbWV0ZXJzKS5tZXRhbG5lc3M7XG4gICAgZGVsZXRlIChtYXRlcmlhbFBhcmFtcyBhcyBUSFJFRS5NZXNoU3RhbmRhcmRNYXRlcmlhbFBhcmFtZXRlcnMpLnJvdWdobmVzcztcblxuICAgIGNvbnN0IGFzc2lnbkhlbHBlciA9IG5ldyBHTFRGTVRvb25NYXRlcmlhbFBhcmFtc0Fzc2lnbkhlbHBlcih0aGlzLnBhcnNlciwgbWF0ZXJpYWxQYXJhbXMpO1xuXG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgndHJhbnNwYXJlbnRXaXRoWldyaXRlJywgZXh0ZW5zaW9uLnRyYW5zcGFyZW50V2l0aFpXcml0ZSk7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnbkNvbG9yKCdzaGFkZUNvbG9yRmFjdG9yJywgZXh0ZW5zaW9uLnNoYWRlQ29sb3JGYWN0b3IpO1xuICAgIGFzc2lnbkhlbHBlci5hc3NpZ25UZXh0dXJlKCdzaGFkZU11bHRpcGx5VGV4dHVyZScsIGV4dGVuc2lvbi5zaGFkZU11bHRpcGx5VGV4dHVyZSwgdHJ1ZSk7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgnc2hhZGluZ1NoaWZ0RmFjdG9yJywgZXh0ZW5zaW9uLnNoYWRpbmdTaGlmdEZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblRleHR1cmUoJ3NoYWRpbmdTaGlmdFRleHR1cmUnLCBleHRlbnNpb24uc2hhZGluZ1NoaWZ0VGV4dHVyZSwgdHJ1ZSk7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgnc2hhZGluZ1NoaWZ0VGV4dHVyZVNjYWxlJywgZXh0ZW5zaW9uLnNoYWRpbmdTaGlmdFRleHR1cmU/LnNjYWxlKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCdzaGFkaW5nVG9vbnlGYWN0b3InLCBleHRlbnNpb24uc2hhZGluZ1Rvb255RmFjdG9yKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCdnaUVxdWFsaXphdGlvbkZhY3RvcicsIGV4dGVuc2lvbi5naUVxdWFsaXphdGlvbkZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnbkNvbG9yKCdtYXRjYXBGYWN0b3InLCBleHRlbnNpb24ubWF0Y2FwRmFjdG9yKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduVGV4dHVyZSgnbWF0Y2FwVGV4dHVyZScsIGV4dGVuc2lvbi5tYXRjYXBUZXh0dXJlLCB0cnVlKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduQ29sb3IoJ3BhcmFtZXRyaWNSaW1Db2xvckZhY3RvcicsIGV4dGVuc2lvbi5wYXJhbWV0cmljUmltQ29sb3JGYWN0b3IpO1xuICAgIGFzc2lnbkhlbHBlci5hc3NpZ25UZXh0dXJlKCdyaW1NdWx0aXBseVRleHR1cmUnLCBleHRlbnNpb24ucmltTXVsdGlwbHlUZXh0dXJlLCB0cnVlKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCdyaW1MaWdodGluZ01peEZhY3RvcicsIGV4dGVuc2lvbi5yaW1MaWdodGluZ01peEZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgncGFyYW1ldHJpY1JpbUZyZXNuZWxQb3dlckZhY3RvcicsIGV4dGVuc2lvbi5wYXJhbWV0cmljUmltRnJlc25lbFBvd2VyRmFjdG9yKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCdwYXJhbWV0cmljUmltTGlmdEZhY3RvcicsIGV4dGVuc2lvbi5wYXJhbWV0cmljUmltTGlmdEZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgnb3V0bGluZVdpZHRoTW9kZScsIGV4dGVuc2lvbi5vdXRsaW5lV2lkdGhNb2RlIGFzIE1Ub29uTWF0ZXJpYWxPdXRsaW5lV2lkdGhNb2RlKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCdvdXRsaW5lV2lkdGhGYWN0b3InLCBleHRlbnNpb24ub3V0bGluZVdpZHRoRmFjdG9yKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduVGV4dHVyZSgnb3V0bGluZVdpZHRoTXVsdGlwbHlUZXh0dXJlJywgZXh0ZW5zaW9uLm91dGxpbmVXaWR0aE11bHRpcGx5VGV4dHVyZSwgZmFsc2UpO1xuICAgIGFzc2lnbkhlbHBlci5hc3NpZ25Db2xvcignb3V0bGluZUNvbG9yRmFjdG9yJywgZXh0ZW5zaW9uLm91dGxpbmVDb2xvckZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgnb3V0bGluZUxpZ2h0aW5nTWl4RmFjdG9yJywgZXh0ZW5zaW9uLm91dGxpbmVMaWdodGluZ01peEZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblRleHR1cmUoJ3V2QW5pbWF0aW9uTWFza1RleHR1cmUnLCBleHRlbnNpb24udXZBbmltYXRpb25NYXNrVGV4dHVyZSwgZmFsc2UpO1xuICAgIGFzc2lnbkhlbHBlci5hc3NpZ25QcmltaXRpdmUoJ3V2QW5pbWF0aW9uU2Nyb2xsWFNwZWVkRmFjdG9yJywgZXh0ZW5zaW9uLnV2QW5pbWF0aW9uU2Nyb2xsWFNwZWVkRmFjdG9yKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCd1dkFuaW1hdGlvblNjcm9sbFlTcGVlZEZhY3RvcicsIGV4dGVuc2lvbi51dkFuaW1hdGlvblNjcm9sbFlTcGVlZEZhY3Rvcik7XG4gICAgYXNzaWduSGVscGVyLmFzc2lnblByaW1pdGl2ZSgndXZBbmltYXRpb25Sb3RhdGlvblNwZWVkRmFjdG9yJywgZXh0ZW5zaW9uLnV2QW5pbWF0aW9uUm90YXRpb25TcGVlZEZhY3Rvcik7XG5cbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCd2MENvbXBhdFNoYWRlJywgdGhpcy52MENvbXBhdFNoYWRlKTtcbiAgICBhc3NpZ25IZWxwZXIuYXNzaWduUHJpbWl0aXZlKCdkZWJ1Z01vZGUnLCB0aGlzLmRlYnVnTW9kZSk7XG5cbiAgICBhd2FpdCBhc3NpZ25IZWxwZXIucGVuZGluZztcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHdpbGwgZG8gdHdvIHByb2Nlc3NlcyB0aGF0IGlzIHJlcXVpcmVkIHRvIHJlbmRlciBNVG9vbiBwcm9wZXJseS5cbiAgICpcbiAgICogLSBTZXQgcmVuZGVyIG9yZGVyXG4gICAqIC0gR2VuZXJhdGUgb3V0bGluZVxuICAgKlxuICAgKiBAcGFyYW0gbWVzaCBBIHRhcmdldCBHTFRGIHByaW1pdGl2ZVxuICAgKiBAcGFyYW0gbWF0ZXJpYWxJbmRleCBUaGUgbWF0ZXJpYWwgaW5kZXggb2YgdGhlIHByaW1pdGl2ZVxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0dXBQcmltaXRpdmUobWVzaDogVEhSRUUuTWVzaCwgbWF0ZXJpYWxJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5fZ2V0TVRvb25FeHRlbnNpb24obWF0ZXJpYWxJbmRleCk7XG4gICAgaWYgKGV4dGVuc2lvbikge1xuICAgICAgY29uc3QgcmVuZGVyT3JkZXIgPSB0aGlzLl9wYXJzZVJlbmRlck9yZGVyKGV4dGVuc2lvbik7XG4gICAgICBtZXNoLnJlbmRlck9yZGVyID0gcmVuZGVyT3JkZXIgKyB0aGlzLnJlbmRlck9yZGVyT2Zmc2V0O1xuXG4gICAgICB0aGlzLl9nZW5lcmF0ZU91dGxpbmUobWVzaCk7XG5cbiAgICAgIHRoaXMuX2FkZFRvTWF0ZXJpYWxTZXQobWVzaCk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdGUgb3V0bGluZSBmb3IgdGhlIGdpdmVuIG1lc2gsIGlmIGl0IG5lZWRzLlxuICAgKlxuICAgKiBAcGFyYW0gbWVzaCBUaGUgdGFyZ2V0IG1lc2hcbiAgICovXG4gIHByaXZhdGUgX2dlbmVyYXRlT3V0bGluZShtZXNoOiBUSFJFRS5NZXNoKTogdm9pZCB7XG4gICAgLy8gT0ssIGl0J3MgdGhlIGhhY2t5IHBhcnQuXG4gICAgLy8gV2UgYXJlIGdvaW5nIHRvIGR1cGxpY2F0ZSB0aGUgTVRvb25NYXRlcmlhbCBmb3Igb3V0bGluZSB1c2UuXG4gICAgLy8gVGhlbiB3ZSBhcmUgZ29pbmcgdG8gY3JlYXRlIHR3byBnZW9tZXRyeSBncm91cHMgYW5kIHJlZmVyIHNhbWUgYnVmZmVyIGJ1dCBkaWZmZXJlbnQgbWF0ZXJpYWwuXG4gICAgLy8gSXQncyBob3cgd2UgZHJhdyB0d28gbWF0ZXJpYWxzIGF0IG9uY2UgdXNpbmcgYSBzaW5nbGUgbWVzaC5cblxuICAgIC8vIG1ha2Ugc3VyZSB0aGUgbWF0ZXJpYWwgaXMgbXRvb25cbiAgICBjb25zdCBzdXJmYWNlTWF0ZXJpYWwgPSBtZXNoLm1hdGVyaWFsO1xuICAgIGlmICghKHN1cmZhY2VNYXRlcmlhbCBpbnN0YW5jZW9mIE1Ub29uTWF0ZXJpYWwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgd2hldGhlciB3ZSByZWFsbHkgaGF2ZSB0byBwcmVwYXJlIG91dGxpbmUgb3Igbm90XG4gICAgaWYgKHN1cmZhY2VNYXRlcmlhbC5vdXRsaW5lV2lkdGhNb2RlID09PSAnbm9uZScgfHwgc3VyZmFjZU1hdGVyaWFsLm91dGxpbmVXaWR0aEZhY3RvciA8PSAwLjApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBtYWtlIGl0cyBtYXRlcmlhbCBhbiBhcnJheVxuICAgIG1lc2gubWF0ZXJpYWwgPSBbc3VyZmFjZU1hdGVyaWFsXTsgLy8gbWVzaC5tYXRlcmlhbCBpcyBndWFyYW50ZWVkIHRvIGJlIGEgTWF0ZXJpYWwgaW4gR0xURkxvYWRlclxuXG4gICAgLy8gZHVwbGljYXRlIHRoZSBtYXRlcmlhbCBmb3Igb3V0bGluZSB1c2VcbiAgICBjb25zdCBvdXRsaW5lTWF0ZXJpYWwgPSBzdXJmYWNlTWF0ZXJpYWwuY2xvbmUoKSBhcyBNVG9vbk1hdGVyaWFsO1xuICAgIG91dGxpbmVNYXRlcmlhbC5uYW1lICs9ICcgKE91dGxpbmUpJztcbiAgICBvdXRsaW5lTWF0ZXJpYWwuaXNPdXRsaW5lID0gdHJ1ZTtcbiAgICBvdXRsaW5lTWF0ZXJpYWwuc2lkZSA9IFRIUkVFLkJhY2tTaWRlO1xuICAgIG1lc2gubWF0ZXJpYWwucHVzaChvdXRsaW5lTWF0ZXJpYWwpO1xuXG4gICAgLy8gbWFrZSB0d28gZ2VvbWV0cnkgZ3JvdXBzIG91dCBvZiBhIHNhbWUgYnVmZmVyXG4gICAgY29uc3QgZ2VvbWV0cnkgPSBtZXNoLmdlb21ldHJ5OyAvLyBtZXNoLmdlb21ldHJ5IGlzIGd1YXJhbnRlZWQgdG8gYmUgYSBCdWZmZXJHZW9tZXRyeSBpbiBHTFRGTG9hZGVyXG4gICAgY29uc3QgcHJpbWl0aXZlVmVydGljZXMgPSBnZW9tZXRyeS5pbmRleCA/IGdlb21ldHJ5LmluZGV4LmNvdW50IDogZ2VvbWV0cnkuYXR0cmlidXRlcy5wb3NpdGlvbi5jb3VudCAvIDM7XG4gICAgZ2VvbWV0cnkuYWRkR3JvdXAoMCwgcHJpbWl0aXZlVmVydGljZXMsIDApO1xuICAgIGdlb21ldHJ5LmFkZEdyb3VwKDAsIHByaW1pdGl2ZVZlcnRpY2VzLCAxKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkZFRvTWF0ZXJpYWxTZXQobWVzaDogVEhSRUUuTWVzaCk6IHZvaWQge1xuICAgIGNvbnN0IG1hdGVyaWFsT3JNYXRlcmlhbHMgPSBtZXNoLm1hdGVyaWFsO1xuICAgIGNvbnN0IG1hdGVyaWFsU2V0ID0gbmV3IFNldDxUSFJFRS5NYXRlcmlhbD4oKTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KG1hdGVyaWFsT3JNYXRlcmlhbHMpKSB7XG4gICAgICBtYXRlcmlhbE9yTWF0ZXJpYWxzLmZvckVhY2goKG1hdGVyaWFsKSA9PiBtYXRlcmlhbFNldC5hZGQobWF0ZXJpYWwpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbWF0ZXJpYWxTZXQuYWRkKG1hdGVyaWFsT3JNYXRlcmlhbHMpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgbWF0ZXJpYWxTZXQpIHtcbiAgICAgIGlmIChtYXRlcmlhbCBpbnN0YW5jZW9mIE1Ub29uTWF0ZXJpYWwpIHtcbiAgICAgICAgdGhpcy5fbVRvb25NYXRlcmlhbFNldC5hZGQobWF0ZXJpYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3BhcnNlUmVuZGVyT3JkZXIoZXh0ZW5zaW9uOiBWMU1Ub29uU2NoZW1hLlZSTUNNYXRlcmlhbHNNVG9vbik6IG51bWJlciB7XG4gICAgLy8gdHJhbnNwYXJlbnRXaXRoWldyaXRlIHJhbmdlcyBmcm9tIDAgdG8gKzlcbiAgICAvLyBtZXJlIHRyYW5zcGFyZW50IHJhbmdlcyBmcm9tIC05IHRvIDBcbiAgICBjb25zdCBlbmFibGVkWldyaXRlID0gZXh0ZW5zaW9uLnRyYW5zcGFyZW50V2l0aFpXcml0ZTtcbiAgICByZXR1cm4gKGVuYWJsZWRaV3JpdGUgPyAwIDogMTkpICsgKGV4dGVuc2lvbi5yZW5kZXJRdWV1ZU9mZnNldE51bWJlciA/PyAwKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBdURBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFL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
