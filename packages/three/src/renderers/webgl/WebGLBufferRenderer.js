function WebGLBufferRenderer( gl, extensions, info, capabilities ) {

	const isWebGL2 = capabilities.isWebGL2;

	let mode;

	function setMode( value ) {

		mode = value;

	}

	function render( start, count ) {

		gl.drawArrays( mode, start, count );

		info.update( count, mode, 1 );

	}

	function renderInstances( start, count, primcount ) {

		if ( primcount === 0 ) return;

		let extension, methodName;

		if ( isWebGL2 ) {

			extension = gl;
			methodName = 'drawArraysInstanced';

		} else {

			extension = extensions.get( 'ANGLE_instanced_arrays' );
			methodName = 'drawArraysInstancedANGLE';

			if ( extension === null ) {

				console.error( 'THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.' );
				return;

			}

		}

		extension[ methodName ]( mode, start, count, primcount );

		info.update( count, mode, primcount );

	}

	// @TODO: Rename
	function renderMultiDraw( starts, counts, drawCount ) {

		const extension = extensions.get( 'WEBGL_multi_draw' );

		// @TODO: if error handling for extension === null

		extension.multiDrawElementsWEBGL( mode, counts, 0, type, starts, 0, drawCount );

		// @TODO: info.update()

	}

	function renderMultiDrawInstances( starts, counts, instances, drawCount ) {

		const extension = extensions.get( 'WEBGL_multi_draw' );

		// @TODO: if error handling for extension === null

		extension.multiDrawElementsInstancedWEBGL( mode, counts, 0, type, starts, 0, instances, 0, drawCount );

		// @TODO: info.update()

	}

	//

	this.setMode = setMode;
	this.render = render;
	this.renderInstances = renderInstances;
	this.renderMultiDraw = renderMultiDraw;
	this.renderMultiDrawInstances = renderMultiDrawInstances;

}


export { WebGLBufferRenderer };
