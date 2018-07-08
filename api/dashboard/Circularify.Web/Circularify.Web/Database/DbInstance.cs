namespace Circularify.Web.Db
{
    public class DbInstance
    {
        private static NotifierDatabaseContext _instance;

        public static NotifierDatabaseContext Get
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new NotifierDatabaseContext();
                }

                return _instance;
            }
        }
    }
}