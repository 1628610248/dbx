package com.dbx.agent.oraclejdbc8;

import com.dbx.agent.DatabaseAgent;
import com.dbx.agent.ConnectParams;
import com.dbx.agent.test.JdbcFakeExecutionBehaviorTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.sql.SQLException;
import java.util.List;
import java.util.Locale;

class OracleJdbc8AgentTest extends JdbcFakeExecutionBehaviorTest {
    @Override
    protected DatabaseAgent createAgent() {
        return new OracleJdbc8Agent();
    }

    @Override
    protected String resultSetSql() {
        return "CALL DBMS_XPLAN.DISPLAY_CURSOR()";
    }

    @Test
    void buildUrlUsesExplicitConnectionString() {
        ConnectParams params = new ConnectParams(
            "oracle.example.com",
            1521,
            "ORCL",
            "scott",
            "tiger",
            "",
            "jdbc:oracle:thin:@oracle.example.com:1521:ORCL",
            false
        );

        Assertions.assertEquals("jdbc:oracle:thin:@oracle.example.com:1521:ORCL", OracleJdbc8Agent.buildUrl(params));
    }

    @Test
    void prepareExecutableSqlKeepsPlsqlObjectTerminator() {
        String sql = "CREATE OR REPLACE PROCEDURE APP_PROC AS BEGIN NULL; END;";

        Assertions.assertEquals(sql, OracleJdbc8Agent.prepareExecutableSql(sql));
    }

    @Test
    void prepareExecutableSqlTrimsPlainStatementTerminator() {
        Assertions.assertEquals("SELECT 1 FROM DUAL", OracleJdbc8Agent.prepareExecutableSql("SELECT 1 FROM DUAL;"));
    }
}
