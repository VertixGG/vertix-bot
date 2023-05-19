import Debugger from "@internal/modules/debugger";

import InitializeBase from "@internal/bases/initialize-base";

export abstract class CacheBase<CacheResult> extends InitializeBase {
    private cache: Map<string, CacheResult>;

    private cacheDebugger: Debugger;

    public constructor( debugState = true  ) {
        super();

        this.cacheDebugger = new Debugger( this, undefined, debugState );

        this.cache = new Map<string, CacheResult>();
    }

    protected getCache( key: string ) {
        this.cacheDebugger.log( this.getCache, `Getting cache for key: '${ key }'` );

        const result = this.cache.get( key );

        if ( result ) {
            this.cacheDebugger.log( this.getCache, `Got cache for key: '${ key }'` );
            this.cacheDebugger.dumpDown( this.setCache, result );
        }

        return result;
    }

    protected getMap() {
        return this.cache;
    }

    protected setCache( key: string, value: CacheResult ): void {
        this.cacheDebugger.log( this.setCache, `Setting cache for key: '${ key }'` );

        this.cacheDebugger.dumpDown( this.setCache, value );

        this.cache.set( key, value );
    }

    protected deleteCache( key: string ): boolean {
        this.cacheDebugger.log( this.deleteCache, `Deleting cache for key: '${ key }'` );

        return this.cache.delete( key );
    }

    protected deleteCacheWithPrefix( prefix: string ): void {
        this.cacheDebugger.log( this.deleteCacheWithPrefix, `Deleting cache prefix: '${ prefix }'` );

        for ( const key of this.cache.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.deleteCache( key );
            }
        }
    }
}