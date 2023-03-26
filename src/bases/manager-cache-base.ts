import Debugger from "@dynamico/utils/debugger";

import InitializeBase from "@internal/bases/initialize-base";

export abstract class ManagerCacheBase<CacheResult> extends InitializeBase {
    protected debugger: Debugger;

    private cache: Map<string, CacheResult>;

    public constructor( debugState = true  ) {
        super();

        this.debugger = new Debugger( this, undefined, debugState );

        this.cache = new Map<string, CacheResult>();
    }

    protected getCache( key: string ) {
        this.debugger.log( this.getCache, `Getting cache for key '${ key }':` );

        const result = this.cache.get( key );

        if ( result ) {
            this.debugger.log( this.getCache, `Got cache for key '${ key }':`, result );
        }

        return result;
    }

    protected setCache( key: string, value: any ): void {
        this.debugger.log( this.setCache, `Setting cache for key: '${ key }':`, value );

        this.cache.set( key, value );
    }

    protected deleteCache( key: string ): boolean {
        this.debugger.log( this.deleteCache, `Deleting cache for key: '${ key }'` );

        return this.cache.delete( key );
    }

    protected deleteCacheWithPrefix( prefix: string ): void {
        this.debugger.log( this.deleteCacheWithPrefix, `Deleting cache with prefix: '${ prefix }'` );

        for ( const key of this.cache.keys() ) {
            if ( key.startsWith( prefix ) ) {
                this.deleteCache( key );
            }
        }
    }
}
