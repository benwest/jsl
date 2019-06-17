var jsl = require('./jsl');

// var {
    
//     float, vec2, vec3, vec4,
//     int, ivec2, ivec3, ivec4,
//     bool, bvec2, bvec3, bvec4,
//     mat2, mat3, mat4,
//     sampler2D, samplerCube,
    
//     uniform, attribute, varying,
    
//     add, subtract, multiply, divide,
    
//     sin, cos, tan
    
// } = jsx;

class Pipe {
    
    map ( fn ) {
        
        return fn( this );
        
    }
    
}

class Uniform extends Pipe {
    
    constructor ( type, name ) {
        
        this.type = type;
        this.name = name;
        
    }
    
    declare () {
        
        return `uniform ${ this.type } ${ this.name };`
        
    }
    
    write () {
        
        return this.name;
        
    }
    
}

class Primitive extends Pipe {
    
    constructor ( type, value ) {
        
        this.type = type;
        this.value = value;
        
    }
    
    write () {
        
        return this.value;
        
    }
    
}

class Float extends Primitive {
    
    constructor ( value ) {
        
        value = Number( value );
        
        if ( isNaN( value ) ) throw new Error( 'Bad argument passed to float' );
        
        super( 'float', value );
        
    }
    
}

class Bool extends Primitive {
    
    constructor ( value ) {
        
        if ( value !== true && value !== false ) throw new Error( 'Bad argument passed to bool' );
        
        super( 'bool', value );
        
    }
    
}

class Func extends Pipe {
    
    constructor ( type, name, args ) {
        
        this.name = name;
        this.type = type;
        
        args = args.map( arg => typeof arg === 'number' ? new Float( arg ) : arg );
        
        if ( !this.validate( args ) ) throw new Error( `Bad arguments passed to ${ name }` );
        
    }
    
    validate () {
        
        return true;
        
    }
    
    write () {
        
        return `${ this.name }( ${ this.args.map( arg => arg.write() ).join(', ') } )`
        
    }
    
}

class Vec extends Func {
    
    constructor ( length, args ) {
        
        args = args.map( arg => {
            
            if ( typeof arg === 'number' ) {
                
                return new Float( arg );
                
            } else if ( !( arg instanceof Float ) && !( arg instanceof Vec ) ) {
                
                throw new Error( `Bad argument passed to vec${ length }` );
                
            } else {
                
                return arg;
                
            }
            
        });
        
        var argsLength = args.reduce( ( sum, arg ) => {
            
            return sum + ( arg instanceof Float ? 1 : arg.length );
            
        }, 0 );
        
        if ( argsLength !== length ) {
            
            throw new Error( `Too ${ argsLength < length ? 'few' : 'many' } arguments passed to vec${ length }` );
            
        }
        
        super( 'vec' + length, args );
        
        this.length = length;
        
    }
    
    write () {
        
        return this.args.join()
        
    }
    
}

var write = root => root.write();

var cls = ctor => ( ...args ) => new ctor( ...args );

var uniform = cls( Uniform );
var vec2 = cls( Vec( 2 ) );
var vec3 = cls( Vec( 3 ) );
var vec4 = cls( Vec( 4 ) );

var resolution = uniform( vec2, 'resolution' );

var shader = gl_FragCoord
    .map( p => divide( p, resolution ) )
    .map( p => vec4( p, 0, 1 ) )
    .map( gl_FragColor )

console.log( shader );