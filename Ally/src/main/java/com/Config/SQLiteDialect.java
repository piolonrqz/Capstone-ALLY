package com.Config;

import org.hibernate.dialect.Dialect;
import org.hibernate.dialect.identity.IdentityColumnSupportImpl;
import org.hibernate.dialect.identity.IdentityColumnSupport;
import org.hibernate.engine.jdbc.dialect.spi.DialectResolutionInfo;
import java.sql.Types;

public class SQLiteDialect extends Dialect {

    protected void registerColumnType(int code, String name) {
        
    }
    
    public SQLiteDialect(DialectResolutionInfo info) {
        super(info);
        registerColumnType(Types.INTEGER, "integer");
        registerColumnType(Types.VARCHAR, "varchar");
        registerColumnType(Types.BLOB, "blob");
        registerColumnType(Types.FLOAT, "float");
        registerColumnType(Types.DOUBLE, "double");
        registerColumnType(Types.BOOLEAN, "boolean");
    }


    @Override
    public IdentityColumnSupport getIdentityColumnSupport() {
        return new IdentityColumnSupportImpl() {
            @Override
            public boolean supportsIdentityColumns() {
                return true;
            }
    
            @Override
            public String getIdentitySelectString(String table, String column, int type) {
                return "select last_insert_rowid()";
            }
    
            @Override
            public String getIdentityColumnString(int type) {
                // SQLite uses "integer primary key autoincrement" for identity columns
                return "integer";
            }
    
            @Override
            public boolean hasDataTypeInIdentityColumn() {
                return false; // SQLite doesn't allow specifying type in identity column
            }
        };
    }

    public String getIdentitySelectString() {
        return "SELECT last_insert_rowid()";
    }
    @Override
    public boolean hasAlterTable() {
        return false;
    }

    @Override
    public boolean dropConstraints() {
        return false;
    }

    @Override
    public String getDropForeignKeyString() {
        return "";
    }

    @Override
    public String getAddForeignKeyConstraintString(String cn, String[] fk, String t, String[] pk, boolean r) {
        return "";
    }

    @Override
    public String getAddPrimaryKeyConstraintString(String constraintName) {
        return "";
    }

    @Override
    public boolean supportsCascadeDelete() {
        return false;
    }
}