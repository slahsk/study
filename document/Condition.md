# Condition

    public class JdbcTemplateCondition implements Condition{
    
    	@Override
    	public boolean matches(ConditionContext context, AnnotatedTypeMetadata data) {
    		try {
    			context.getClassLoader().loadClass("org.springframework.jdbc.core.JdbcTemplate");
    			return true;
    		} catch (ClassNotFoundException e) {
    			return false;
    		}
    	}
    }
